// initial DOM walk
import flyTemplate from 'fly-template';
import walkDom from './lib/walk-dom.js';

const tags = {};

const registerComponent = function registerComponent(options = {}) {
  const {tag, controller} = options;

  tags[tag.toUpperCase()] = controller;
};

// quick concept note:

// heirachies inherit data. but siblings with undefined parents could be spread


var StateWorker = require('worker!./workers/state.js');
var stateWorker = new StateWorker();

document.addEventListener('DOMContentLoaded', function() {
  let components = [];
  let currentParent = undefined;

  let currentId = 0;
  const nodeMap = Object.create(null);

  const registerEl = function(el) {
    currentId++;
    el.__currentId = currentId;
    nodeMap[currentId] = el;
    return currentId;
  };

  walkDom(document.body, function(el) {
    const tag = el.tagName;
    const controller = tags[tag];

    if (el.nodeName === '#text') {
      if (el.textContent.match(/\$\{/)) {
        stateWorker.postMessage(JSON.stringify({
          action: 'registerTemplate',
          template: el.textContent,
          el: registerEl(el),
        }));
      }
    } else {
      if (controller) {
        stateWorker.postMessage(JSON.stringify({
          action: 'registerComponent',
          tag: tag,
          el: registerEl(el),
          controller: controller.toString(),
        }));
      }
    }
  });


  stateWorker.onmessage = function(event) {
    const message = JSON.parse(event.data);

    if (message.action === 'updateState') {
      Object.keys(message.textContent).forEach(function(elId) {
        nodeMap[elId].textContent = message.textContent[elId];
      });
    }
  };

  const render = function() {
    stateWorker.postMessage('render');
    window.requestAnimationFrame(render);
  };
  render();
});


registerComponent({
  tag: 'hello',
  controller: function controllerFn() {
    var randomString = function() {
      const ml = Math.floor(Math.random() * 26 + 1);
      let word = '';
      for (let l = 0; l < ml; l++) {
        word += String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
      return word;
    };

    this.name = randomString();

    setInterval(() => {
      this.name = randomString();
    }, Math.floor(Math.random() * 25 + 1) * 1000);


    this.time = '' + new Date();
    this.list = [
    ];

    for (let i = 0; i < 26; i++) {
      this.list.push(String.fromCharCode(65 + i));
    }

    setInterval(() => {
      this.time = +new Date();
    }, 1000);
  },
});
