/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'TwoFactorAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.NanoService',
    'foam.nanos.session.Session'
  ],

  methods: [
    {
      name: 'start',
      javaCode:
        `if ( getDelegate() instanceof NanoService ) {
          ((NanoService) getDelegate()).start();
        }`
    },
    {
      type: 'Boolean',
      name: 'check',
      javaCode: `
        Session session = x.get(Session.class);
        User user = (User) x.get("user");

        return user != null &&
          user.getTwoFactorEnabled() &&
          ! session.getContext().getBoolean("twoFactorSuccess") ? false :
            getDelegate().check(x , permission);
      `
    }
  ]
});
