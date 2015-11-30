import flyTemplate from 'fly-template';
import zone from 'zone.js';

const components = [];
let currentParent = undefined;

function stateChanged(oldState, newState) {
  if (oldState !== newState) {
    return true;
  }
  return false; // nothing changed
};

const Render = function(render, state) {
  postMessage(JSON.stringify({
    action: 'updateTextContent',
    el: render.el,
    template: render.template(state),
  }));
};

const detectChanges = function() {
  components.forEach(function checkComponentStateChanged(component) {
    const stringifiedState = JSON.stringify(component.state);

    if (stateChanged(component.previousState, stringifiedState)) {
      component.previousState = stringifiedState;

      component.renderDescendants.forEach(function(render) {
        // would batching these increase performance?
        Render(render, component.state);
      });
    }
  });
};

const myZone = zone.zone.fork({
  afterTask: detectChanges,
});

onmessage = function onmessage(event) {
  const message = JSON.parse(event.data);

  if (message.action === 'registerComponent') {
    const state = {};

    const component = {
      tag: message.tag,
      el: message.el,
      controller: eval('(' + message.controller + ')').bind(state),
      previousState: {},
      state: state,
      renderDescendants: [],
    };

    components.push(component);

    currentParent = component;

    myZone.run(function() {
      component.controller();
    });
  }

  if (message.action === 'registerTemplate') {
    const render = {
      el: message.el,
      parent: currentParent,
      template: flyTemplate(message.template),
    };
    currentParent.renderDescendants.push(render);
    Render(render, currentParent.state);
  }

  detectChanges();
};
