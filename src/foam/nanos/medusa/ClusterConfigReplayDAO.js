/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ClusterConfigReplayDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `On status change to ONLINE initiate replay`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.MAX',
    'static foam.mlang.MLang.MIN',
    'static foam.mlang.MLang.OR',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Max',
    'foam.mlang.sink.Min',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      ClusterConfig nu = (ClusterConfig) obj;
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);
      if ( old != null &&
           old.getStatus() != nu.getStatus() &&
           nu.getStatus() == Status.ONLINE ) {

        getLogger().info(nu.getName(), old.getStatus().getLabel(), "->", nu.getStatus().getLabel().toUpperCase());

        ClusterConfig config = nu;
        ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
        ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

        // If a Node comming online, begin replay from it.
        if ( support.getStandAlone() &&
             nu.getType() == MedusaType.NODE ) {
          // see ClusterConfigMonitor
          getLogger().debug("standalone");
          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          replaying.setStartTime(new java.util.Date());

          DAO dao = (DAO) x.get("medusaNodeDAO");
          Min min = (Min) MIN(MedusaEntry.INDEX);
          Max max = (Max) MAX(MedusaEntry.INDEX);
          Count count = new Count();
          Sequence seq = new Sequence.Builder(x)
            .setArgs(new Sink[] {count, min, max})
            .build();
          dao.select(seq);
          getLogger().debug("put", "standalone", "count", count.getValue(), "max", max.getValue());
          if ( ((Long) count.getValue()) > 0 ) {
            replaying.setReplayIndex((Long) max.getValue());

            DaggerService dagger = (DaggerService) x.get("daggerService");
            if ( ((Long) max.getValue()) > dagger.getGlobalIndex(x)) {
              dagger.setGlobalIndex(x, ((Long) max.getValue()));
            }

            // select from internal and put to consensus - medusaMediatorDAO
            Sink sink = new RetryClientSinkDAO.Builder(x)
              .setName("medusaNodeDAO")
              .setDelegate((DAO) x.get("medusaMediatorDAO"))
              .setMaxRetryAttempts(0)
              .setMaxRetryDelay(0)
              .build();
            dao.select(sink);
          } else {
            replaying.setReplaying(false);
            replaying.setEndTime(new java.util.Date());
          }
        } else if ( ( myConfig.getType() == MedusaType.MEDIATOR ||
               myConfig.getType() == MedusaType.NERF ) &&
               ( ( myConfig.getZone() == 0L &&
                   config.getType() == MedusaType.NODE &&
                   config.getZone() == 0L ) ||
                 ( config.getType() == MedusaType.MEDIATOR &&
                   config.getZone() == myConfig.getZone() - 1L ) ) &&
               config.getRegion() == myConfig.getRegion() &&
               config.getRealm() == myConfig.getRealm() ) {

          String serviceName = "medusaNodeDAO";
          if ( config.getType() == MedusaType.MEDIATOR ) {
            serviceName = "medusaEntryDAO";
          }
          DAO clientDAO = support.getClientDAO(x, serviceName, myConfig, config);
          clientDAO = new RetryClientSinkDAO.Builder(x)
            .setName(serviceName)
            .setDelegate(clientDAO)
            .setMaxRetryAttempts(support.getMaxRetryAttempts())
            .setMaxRetryDelay(support.getMaxRetryDelay())
            .build();

          // NOTE: using internalMedusaDAO else we'll block on ReplayingDAO.
          DAO dao = (DAO) x.get("internalMedusaDAO");
          dao = dao.where(EQ(MedusaEntry.PROMOTED, false));
          Min min = (Min) dao.select(MIN(MedusaEntry.INDEX));

          ReplayDetailsCmd details = new ReplayDetailsCmd();
          details.setRequester(myConfig.getId());
          details.setResponder(config.getId());
          if ( min != null &&
               min.getValue() != null ) {
            details.setMinIndex((Long) min.getValue());
          }
          getLogger().info("ReplayDetailsCmd", "from", myConfig.getId(), "to", config.getId(), "request");
          details = (ReplayDetailsCmd) clientDAO.cmd_(x, details);
          getLogger().info("ReplayDetailsCmd", "from", myConfig.getId(), "to", config.getId(), "response", details);

          synchronized ( this ) {
            DaggerService dagger = (DaggerService) x.get("daggerService");
            ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
            if ( replaying.getStartTime() == null ) {
              replaying.setStartTime(new java.util.Date());
              replaying.setIndex(dagger.getGlobalIndex(x));
            }
            if ( details.getMaxIndex() > dagger.getGlobalIndex(x)) {
              dagger.setGlobalIndex(x, details.getMaxIndex());
            }

            if ( details.getMaxIndex() > replaying.getReplayIndex() ) {
              replaying.setReplayIndex(details.getMaxIndex());
            }
            replaying.getReplayNodes().put(details.getResponder(), details);

            getLogger().debug(myConfig.getId(), "replaying", replaying.getReplaying(), "index", replaying.getIndex(), "replayIndex", replaying.getReplayIndex(), "node quorum", support.getHasNodeQuorum());

            if ( replaying.getIndex() >= replaying.getReplayIndex() &&
                 support.getHasNodeQuorum() ) {
              // special intial case - no data, or baseline
              // FIXME/REVIEW - not working - on fresh start, zone 1 mediators never go online.
              ((DAO) x.get("localMedusaEntryDAO")).cmd(new ReplayCompleteCmd());
            }
          }

          if ( details.getMaxIndex() > 0 ) {
            ReplayCmd cmd = new ReplayCmd();
            cmd.setDetails(details);
            cmd.setServiceName("medusaMediatorDAO"); // TODO: configuration

            getLogger().info("ReplayCmd", "from", myConfig.getId(), "to", config.getId(), "request", cmd.getDetails());
            cmd = (ReplayCmd) clientDAO.cmd_(x, cmd);
            getLogger().info("ReplayCmd", "from", myConfig.getId(), "to", config.getId(), "response");
          }
        }
      }
      return nu;
      `
    }
  ]
});
