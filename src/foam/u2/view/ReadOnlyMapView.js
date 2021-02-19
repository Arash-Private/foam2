/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ReadOnlyMapView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  exports: [
  ],

  css: `
  ^ .left {
    width: 50%;
  }
  ^ .right {
    position: absolute;
    right: 0px;
    width: 50%;
  }
  ^ .foam-u2-layout-Rows {
    overflow: hidden;
    border-bottom: 1px solid #d9d9d9;
    padding-bottom: 8px;
    padding-top: 8px;
  }
  `,

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(this.slot(function(data) {
          let e = self.E();
          for (let [key, value] of data) {
            e.add(self.Rows.create()
              .start().addClass('left')
                .add(key.toString())
              .end()
              .start().addClass('right')
                .add(value.toString())
              .end()
            );
            console.log(key + ' = ' + value);
          }
          return e;
        }));
    }
  ]
});
