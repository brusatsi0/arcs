/**
 * @license
 * Copyright (c) 2017 Google Inc. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * Code distributed by Google as part of this project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

let Suggestinator = require("../../suggestinator.js");
let {RecipeBuilder} = require('../../recipe.js');
let recipes = require("../demo/recipes.js");

class DemoBase extends HTMLElement {
  constructor() {
    super();
    this.suggestinator = new Suggestinator();
  }
  connectedCallback() {
    if (!this._mounted) {
      this._mounted = true;
      this.mount();
    }
  }
  mount() {
    this._root = this.attachShadow({mode: 'open'});
    this._root.appendChild(document.importNode(this.template.content, true));
    this.didMount();
  }
  didMount() {
  }
  $(selector) {
    return this._root && this._root.querySelector(selector);
  }
  get arc() {
    return this._arc;
  }
  set arc(arc) {
    this._arc = arc;
    this.update();
  }
  get stages() {
    return this._stages;
  }
  set stages(stages) {
    this.stageNo = 0;
    this._stages = stages;
    this.update();
  }
  update() {
    if (this.arc && this.stages) {
      this.nextStage();
    }
  }
  nextStage() {
    this.stage = this.stages[this.stageNo % this.stages.length];
    //this.stage.recipes = recipes;
    this.stageNo++;
    this.suggest();
  }
  suggest() {
    if (this.stage.recipes) {
      this.suggestinator._getSuggestions = () => this.stage.recipes.map(
          r => this.buildRecipe(r)
        );
      this.suggestinator
        .suggestinate(this.arc)
        .then(plans =>
          plans.forEach((plan, i) => {
            this.suggestions.add(plan, i);
          })
        );
    }
  }
  buildRecipe(info) {
    let rb = new RecipeBuilder();
    info.particles.forEach(pi => {
      let p = rb.addParticle(pi.name);
      if (pi.constrain) {
        Object.keys(pi.constrain).forEach(k => {
          p.connectConstraint(k, pi.constrain[k]);
        });
      }
    });
    let recipe = rb.build();
    recipe.name = info.name;
    return recipe;
  }
}

module.exports = DemoBase;
