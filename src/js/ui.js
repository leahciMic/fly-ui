// initial DOM walk

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
  tags[tag] = controller;
};

document.addEventListener('DOMContentLoaded', function() {
  walkDom(document.body, function(ele) {
    console.log(ele);
  });
});

registerComponent({
  tag: 'hello',
  controller: function controllerFn() {
    this.name = 'Michael';
    this.time = '' + new Date();
    setTimeout(() => {
      this.time = '' + new Date();
    });
  },
});
