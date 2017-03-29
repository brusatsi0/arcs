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

var parser = require("./parser.js");
var runtime = require("./runtime.js");
var ParticleSpec = require("./particle-spec.js");
var tracing = require('../tracelib/trace.js');

function define(def, update) {
  let spec = new ParticleSpec(parser.parse(def));
  return class extends Particle {
    static get spec() {
      return spec;
    }
    static get name() {
      return this.spec.type;
    }
    constructor(arc) {
      super(arc);
    }
    setViews(views) {
      var inputViews = new Map();
      for (let input of this.inputs()) {
        this.on(views, input.name, 'change', e => {
            var relevance = update(views, e);
            if (relevance !== undefined)
              this.relevance = relevance;
        });
      }
    }
  };
}

class Particle {
  constructor(arc) {
    this.arc = arc;
    this.spec = this.constructor.spec.resolve(arc.scope);
    if (this.spec.inputs.length == 0)
      this.extraData = true;
    arc.register(this);
  }

  // Override this to do stuff
  setViews(views) {

  }

  set relevance(r) {
    this.arc.updateRelevance(r);
  }

  // Override this to do stuff
  dataUpdated() {
  }

  commitData(relevance) {
    this.arcParticle.commitData(relevance);
  }

  inputs() {
    return this.spec.inputs;
  }

  outputs() {
    return this.spec.outputs;
  }


  on(views, name, action, f) {
    var trace = tracing.start({cat: 'particle', name: this.constructor.name + "::on", args: {view: name, event: action}});
    views.get(name).on(action, tracing.wrap({cat: 'particle', name: this.constructor.name, args: {view: name, event: action}}, f));
    trace.end();
  }
}

exports.define = define;
exports.Particle = Particle;
