/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
"use strict";

var { Particle, ViewChanges, StateChanges, SlotChanges } = require("../../runtime/particle.js");

function difference(a, b) {
  var result = new Map();
  a.forEach(value => result.set(JSON.stringify(value.data), value));
  b.map(a => JSON.stringify(a.data)).forEach(value => result.delete(value));
  return result.values();
}

class Chooser extends Particle {
  setViews(views) {
    this.when([new ViewChanges(views, ['choices', 'resultList'], 'change')], async e => {
      var inputList = await views.get('choices').toList();
      var outputList = await views.get('resultList').toList();

      var result = [...difference(inputList, outputList)];
      this.emit('values', result);
    });

    this.when([new StateChanges('values'), new SlotChanges()], async e => {
      if (this.states.get('values').length > 0) {
        var slot = await this.requireSlot('action');
        var content = 'Choose:<br>';
        for (var i in this.states.get('values')) {
          let value = this.states.get('values')[i];
          let eventName = `clack${i}`;
          content += `${value.data.name} <button events on-click=${eventName}>Choose me!</button><br>`;
          slot.clearEventHandlers(eventName);
          slot.registerEventHandler(eventName, a => views.get('resultList').store(value));
         }
        slot.render(content);
      } else {
        this.releaseSlot('action');
      }
    });
  }
}

module.exports = Chooser;
