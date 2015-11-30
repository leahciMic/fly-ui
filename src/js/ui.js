// initial DOM walk
import flyTemplate from 'fly-template';
import walkDom from './lib/walk-dom.js';

let isScrolling = false;
let isScrollingTimeout;
window.addEventListener('scroll', function() {
  if (!isScrolling) {
    console.log('is scrolling');
  }
  isScrolling = true;
  if (isScrollingTimeout) window.clearTimeout(isScrollingTimeout);
  isScrollingTimeout = window.setTimeout(function() {
    console.log('stopped scrolling');
    isScrolling = false;
    isScrollingTimeout = undefined;
  }, 150);
});

const tags = {};

const registerComponent = function registerComponent(options = {}) {
  const {tag, controller} = options;

  tags[tag.toUpperCase()] = controller;
};

// quick concept note:

// heirachies inherit data. but siblings with undefined parents could be spread


var StateWorker = require('worker!./workers/state.js');
var stateWorker = new StateWorker();

document.addEventListener('DOMContentLoaded', function onDomReady() {
  let components = [];
  let currentParent = undefined;

  let currentId = 0;
  const nodeMap = Object.create(null);

  const registerEl = function registerEl(el) {
    currentId++;
    el.__currentId = currentId;
    nodeMap[currentId] = el;
    return currentId;
  };

  walkDom(document.body, function registerComponents(el) {
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

  const pendingTextUpdates = {};
  let firstUpdate = false;

  stateWorker.onmessage = function onStateWorkerUpdate(event) {
    const message = JSON.parse(event.data);

    if (message.action === 'updateTextContent') {
      if (!firstUpdate) {
        console.log('got update');
        firstUpdate = true;
      }

      pendingTextUpdates[message.el] = message.template;
    }
  };

  function updateDom() {
    requestAnimationFrame(updateDom);
    if (isScrolling) {
      return;
    }
    // console.log('updateDom');
    const keys = Object.keys(pendingTextUpdates);

    if (keys.length) {
      const timeStart = performance.now();
      let finished = false;

      while (performance.now() - timeStart < 2) {
        const key = keys.pop();

        if (key === undefined) {
          finished = true;
          break;
        }

        nodeMap[key].textContent = pendingTextUpdates[key];
        delete pendingTextUpdates[key];
      }
      if (!finished) {
        console.warn('could not update everything in 5ms', Object.keys(pendingTextUpdates).length, 'left over');
      } else {
        // console.info('Updated everything');
      }
    }
  };

  updateDom();

  function Render() {
    stateWorker.postMessage('render');
  };

  window.setInterval(Render, 100);

  // const render = function() {
  //   stateWorker.postMessage('render');
  //   window.requestAnimationFrame(render);
  // };
  // render();
});


registerComponent({
  tag: 'hello',
  controller: function controllerFn() {
    var randomString = function generateRandomWord() {
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
    }, Math.floor(Math.random() * 500) + 1);


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
