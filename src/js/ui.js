// initial DOM walk
import flyTemplate from 'fly-template';

const tags = {};

const walkDom = function walkDom(node, func) {
  let currentNode = node;
  func(currentNode);
  currentNode = currentNode.firstChild;

  while (currentNode) {
    walkDom(currentNode, func);
    currentNode = currentNode.nextSibling;
  }
};

const registerComponent = function registerComponent(options = {}) {
  const {tag, controller} = options;

  tags[tag.toUpperCase()] = controller;
};

document.addEventListener('DOMContentLoaded', function() {
  let components = [];
  let currentParent = undefined;

  walkDom(document.body, function(el) {
    const tag = el.tagName;
    const controller = tags[tag];

    if (el.nodeName === '#text') {
      if (el.textContent.match(/\$\{/)) {
        currentParent.renderDescendants.push({
          el: el,
          parent: currentParent,
          template: flyTemplate(el.textContent),
        });
      }
    } else if (controller) {
      const state = {};

      const component = {
        tag: tag,
        el: el,
        controller: controller.bind(state),
        previousState: {},
        state: state,
        renderDescendants: [],
      };

      components.push(component);

      if (!currentParent) {
        currentParent = component;
      }

      component.controller();
    }
  });

  const render = function() {
    components.forEach(function(component) {
      if (stateChanged(component.previousState, component.state)) {
        component.previousState = JSON.parse(JSON.stringify(component.state));
        component.renderDescendants.forEach(function(render) {
          render.el.textContent = render.template(component.state);
        });
      }
    });
    window.requestAnimationFrame(render);
  };
  render();

});

function stateChanged(oldState, newState) {
  if (JSON.stringify(oldState) !== JSON.stringify(newState)) {
    return true;
  }
  return false; // nothing changed
};

registerComponent({
  tag: 'hello',
  controller: function controllerFn() {
    this.name = 'Michael';
    this.time = '' + new Date();
    setInterval(() => {
      this.time = +new Date();
    }, 1);
  },
});
