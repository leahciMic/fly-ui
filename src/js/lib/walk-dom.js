export default function walkDom(node, func) {
  let currentNode = node;
  func(currentNode);
  currentNode = currentNode.firstChild;

  while (currentNode) {
    walkDom(currentNode, func);
    currentNode = currentNode.nextSibling;
  }
}
