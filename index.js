var target = document.body;

// create an observer instance
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    console.log(mutation);
  });
});

// configuration of the observer:
var config = {
  attributes: false,
  childList: true,
  characterData: false,
  subtree: true
};

// pass in the target node, as well as the observer options
observer.observe(target, config);

var button = document.createElement('button');


button.innerText = "Add";

var ul = document.querySelector('ul');

button.addEventListener('click', function() {
	var li = document.createElement('li');
    li.innerText = 'hello world';
    ul.appendChild(li);
});

document.body.appendChild(button);
