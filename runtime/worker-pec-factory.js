// @license
// Copyright (c) 2017 Google Inc. All rights reserved.
// This code may only be used under the BSD style license found at
// http://polymer.github.io/LICENSE.txt
// Code distributed by Google as part of this project is also
// subject to an additional IP rights grant found at
// http://polymer.github.io/PATENTS.txt

'use strict';

const OuterPec = require('./outer-PEC');

module.exports = function(base, id) {
  let channel = new MessageChannel();
  let worker = new Worker('../build/worker-entry.js');
  worker.postMessage({id: `${id}:inner`, base}, [channel.port1]);
  return new OuterPec(channel.port2, `${id}:outer`);
}
