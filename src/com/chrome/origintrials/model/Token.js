/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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
  package: 'com.chrome.origintrials.model',
  name: 'Token',
  properties: [
    {
      class: 'String',
      name: 'origin'
    },
    {
      class: 'String',
      name: 'feature'
    },
    {
      class: 'String',
      name: 'emailAddress'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'rowNumber'
    },
    {
      class: 'String',
      name: 'token'
    },
    {
      class: 'DateTime',
      name: 'expiryTime'
    },
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'Boolean',
      name: 'isSubdomain'
    }
  ]
});
