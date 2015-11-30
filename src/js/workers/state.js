import flyTemplate from 'fly-template';

function stateChanged(oldState, newState) {
  if (oldState !== newState) {
    return true;
  }
  return false; // nothing changed
};

const components = [];
let currentParent = undefined;

onmessage = function onmessage(event) {

  // @todo assumption, onmessage, and postMessage are in order
  if (event.data === 'render') {
    const updates = {
      action: 'updateState',
      textContent: {},
    };

    components.forEach(function checkComponentStateChanged(component) {
      const stringifiedState = JSON.stringify(component.state);

      if (stateChanged(component.previousState, stringifiedState)) {
        component.previousState = stringifiedState;

        component.renderDescendants.forEach(function(render) {
          // would batching these increase performance?
          postMessage(JSON.stringify({
            action: 'updateTextContent',
            el: render.el,
            template: render.template(component.state),
          }));
        });
      }
    });

    if (Object.keys(updates.textContent).length) {
      postMessage(JSON.stringify(updates));
    }

    return;
  }

  const message = JSON.parse(event.data);

  if (message.action === 'registerComponent') {
    console.log('registerComponent');
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

    component.controller();
  }

  if (message.action === 'registerTemplate') {
    currentParent.renderDescendants.push({
      el: message.el,
      parent: currentParent,
      template: flyTemplate(message.template),
    });
  }
};
