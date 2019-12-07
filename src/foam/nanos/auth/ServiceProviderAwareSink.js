/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ServiceProviderAwareSink',
  extends: 'foam.dao.ProxySink',

  documentation: 'Sink which discard non-matching spids.',

  properties: [
    {
      name: 'referencePropertyInfos',
      class: 'FObjectArray',
      of: 'foam.core.PropertyInfo',
      javaFactory: 'return new foam.core.PropertyInfo[0];'
    },
    {
      name: 'support',
      class: 'Object',
      of: 'foam.nanos.auth.ServiceProviderAwareSupport',
      visibility: 'HIDDEN',
      javaType: 'foam.nanos.auth.ServiceProviderAwareSupport',
      javaFactory: 'return new ServiceProviderAwareSupport();'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
  public ServiceProviderAwareSink(foam.core.X x, foam.dao.Sink delegate) {
    this(x, delegate, new foam.core.PropertyInfo[0]);
  }

  public ServiceProviderAwareSink(foam.core.X x, foam.dao.Sink delegate, foam.core.PropertyInfo[] propertyInfos) {
    setX(x);
    setDelegate(delegate);
    setReferencePropertyInfos(propertyInfos);
  }
          `
        }));
      }
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
    ServiceProviderAware sp = getSupport().find(getX(), getReferencePropertyInfos(), obj);
    if ( sp == null ||
      ! sp.getSpid().equals(((User) getX().get("user")).getSpid()) ) {
      return;
    }
    getDelegate().put(obj, sub);
      `
    },
    {
      name: 'remove',
      javaCode: `
    ServiceProviderAware sp = getSupport().find(getX(), getReferencePropertyInfos(), obj);
    if ( sp == null ||
      ! sp.getSpid().equals(((User) getX().get("user")).getSpid()) ) {
      return;
    }
    getDelegate().remove(obj, sub);
      `
    }
  ]
});

