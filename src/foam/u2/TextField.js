/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'TextField',
  extends: 'foam.u2.tag.Input',

  css: `
    ^ {
      font-size: 14px;
      padding: %INPUTVERTICALPADDING% %INPUTHORIZONTALPADDING%;
      border: 1px solid;
      border-radius: 3px;
      color: %INPUTTEXTCOLOR%;
      background-color: %INPUTBACKGROUNDCOLOR%;
      border-color: %INPUTBORDERCOLOR%;
    }

    ^:hover {
      background-color: %INPUTHOVERBACKGROUNDCOLOR%;
      border-color: %INPUTHOVERBORDERCOLOR%;
    }

    ^:hover::placeholder,
    ^:hover:-ms-input-placeholder,
    ^:hover::-ms-input-placeholder {
      color: %INPUTHOVERTEXTCOLOR%;
    }

    ^:focus {
      border-color: %SECONDARYCOLOR%;
    }

    ^:disabled {
      color: %INPUTDISABLEDTEXTCOLOR%;
      background-color: %INPUTDISABLEDBACKGROUNDCOLOR%;
      border-color: %INPUTDISABLEDBORDERCOLOR%;
    }

    ^.error {
      outline: none;
      color: %INPUTERRORTEXTCOLOR%;
      background-color: %INPUTERRORBACKGROUNDCOLOR%;
      border-color: %INPUTERRORBORDERCOLOR%;
    }

    input[type="search"] {
      -webkit-appearance: textfield !important;
    }

    ^:read-only {
      border: none;
      background: rgba(0,0,0,0);
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'displayWidth'
    }
  ],

  methods: [
    function fromProperty(prop) {
      this.SUPER(prop);

      if ( ! this.placeholder && prop.placeholder ) {
        this.placeholder = prop.placeholder;
      }

      if ( ! this.displayWidth ) {
        this.displayWidth = prop.displayWidth;
      }

      if ( ! this.size ) {
        this.size = this.displayWidth;
      }
    }
  ]
});
