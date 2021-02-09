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
  .^ left {
    float: left;
  }
  .^ right {
    float: right;
  }
  .^ lineSeperator {
    width: 10vw;
  }
  `,

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .add(this.slot(function(data) {
          let size = data.size;
          let index = 1;
          let e = self.E();
          for (let [key, value] of data) {
            e.add(self.Rows.create()
              .start().addClass('left')
                .add(key.toString())
              .end()
              .start().addClass('right')
                .add(value.toString())
              .end()
              .callIf(index == size, function() { self.addClass('lineSeperator'); })
              );
            console.log(key + ' = ' + value); // 0 = zero \n 1 = one
            index++;
          }
          return e;
        }));
    }
  ]
});
