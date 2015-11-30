/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _flyTemplate = __webpack_require__(1);

	var _flyTemplate2 = _interopRequireDefault(_flyTemplate);

	var _walkDom = __webpack_require__(2);

	var _walkDom2 = _interopRequireDefault(_walkDom);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// initial DOM walk

	var tags = {};

	var registerComponent = function registerComponent() {
	  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	  var tag = options.tag;
	  var controller = options.controller;

	  tags[tag.toUpperCase()] = controller;
	};

	// quick concept note:

	// heirachies inherit data. but siblings with undefined parents could be spread

	var Worker = __webpack_require__(3);
	var worker = new Worker();

	worker.onmessage = function (msg) {
	  console.log(msg);
	};

	worker.postMessage('hello');

	document.addEventListener('DOMContentLoaded', function () {
	  var components = [];
	  var currentParent = undefined;

	  (0, _walkDom2.default)(document.body, function (el) {
	    var tag = el.tagName;
	    var controller = tags[tag];

	    if (el.nodeName === '#text') {
	      if (el.textContent.match(/\$\{/)) {
	        currentParent.renderDescendants.push({
	          el: el,
	          parent: currentParent,
	          template: (0, _flyTemplate2.default)(el.textContent)
	        });
	      }
	    } else if (controller) {
	      var state = {};

	      var component = {
	        tag: tag,
	        el: el,
	        controller: controller.bind(state),
	        previousState: {},
	        state: state,
	        renderDescendants: []
	      };

	      components.push(component);

	      if (!currentParent) {
	        currentParent = component;
	      }

	      component.controller();
	    }
	  });

	  var render = function render() {
	    components.forEach(function (component) {
	      if (stateChanged(component.previousState, component.state)) {
	        component.previousState = JSON.parse(JSON.stringify(component.state));
	        component.renderDescendants.forEach(function (render) {
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
	    var _this = this;

	    this.name = 'Michael';
	    this.time = '' + new Date();
	    setInterval(function () {
	      _this.time = +new Date();
	    }, 1);
	  }
	});

/***/ },
/* 1 */
/***/ function(module, exports) {

	function parse(str) {
	  var i,
	      l,
	      openCount = 0,
	      startExpressionIndex = false,
	      startIndex = 0,
	      tokens = [];

	  for (i = 0, l = str.length; i <= l; i++) {
	    if (startExpressionIndex === false) {
	      if (str[i] == '$' && str[i+1] == '{') {
	        tokens.push({
	          type: 'text',
	          value: str.substring(startIndex, i)
	        });
	        startExpressionIndex = i;
	      }
	      continue;
	    }

	    if (str[i] == '{') {
	      openCount++;
	    }

	    if (str[i] == '}' && --openCount == 0) {
	      tokens.push({
	        type: 'expression',
	        value: str.substring(startExpressionIndex + 2, i)
	      });
	      startExpressionIndex = false;
	      startIndex = i + 1;
	    }
	  }

	  if (startIndex !== l) {
	    tokens.push({
	      type: 'text',
	      value: str.substring(startIndex, i)
	    });
	  }

	  return tokens;
	}

	function convert(tokens) {
	  var fn = new Function(
	    'return ' + tokens.map(function(token) {
	      return token.type == 'text' ? JSON.stringify(token.value) : token.value;
	    }).join(' + ') + ';'
	  );
	  return function sync(properties) {
	    return fn.call(properties);
	  };
	}

	var API;

	API = function(str) {
	  return convert(parse(str));
	};

	API.parse = parse;
	API.convert = convert;

	module.exports = API;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = walkDom;
	function walkDom(node, func) {
	  var currentNode = node;
	  func(currentNode);
	  currentNode = currentNode.firstChild;

	  while (currentNode) {
	    walkDom(currentNode, func);
	    currentNode = currentNode.nextSibling;
	  }
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() {
		return new Worker(__webpack_require__.p + "561b772c53af5798b515.worker.js");
	};

/***/ }
/******/ ]);