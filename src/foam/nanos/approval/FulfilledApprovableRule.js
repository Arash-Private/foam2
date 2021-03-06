/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'FulfilledApprovableRule',

  documentation: `
    A rule to determine what to do with an approvable once the 
    approval request has been APPROVED
  `,

  javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.Approvable',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.ruler.Operations',
    'java.util.Map'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAwareAgent() {
          
          @Override
          public void execute(X x) {
            Approvable approvable = (Approvable) obj;

            DAO dao = (DAO) getX().get(approvable.getDaoKey());

            FObject currentObjInDao = dao.find(approvable.getObjId());
            FObject objToUpdate = currentObjInDao.fclone();

            Map propsToUpdate = approvable.getPropertiesToUpdate();

            Object[] keyArray = propsToUpdate.keySet().toArray();

            for ( int i = 0; i < keyArray.length; i++ ){
              objToUpdate.setProperty((String) keyArray[i],propsToUpdate.get(keyArray[i]));
            }

            dao.put_(getX(), objToUpdate);
          }
        }, "Updated the object based on a approved approvable");
      `
    }
  ]
});
