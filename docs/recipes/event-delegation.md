# Event delegation 

In the 1st example we use `most.fromEvent` to create a stream from
a `click` event. 

By adding `filter` in conjunction with [element matches](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches)
we can specify which element we want to observe and in this case get the `textContent`
from the element.

The 2nd example is similar, however we use jQuery to handle event delegation.

We use `most.create` to produce a push-stream off of those click events.
Essentially each time a user clicks on the `.inner` that event is added to the
stream which can be observed and processed in a similar manner to the 1st example.

It should be noted that the `dispose` function which calls `container.off` only happens
if the implementor would call `end()`, otherwise the stream will not end and
the event will still be bound.

```js
var most = require('most');

var container = document.querySelector('.container');
most.fromEvent('click', container)
    .filter(function(e){
        return e.target.matches('.hello');
    })
    .observe(function(e){
        return console.log(e.target.textContent)
    });
```

```js
var $ = require('jquery');
var container = $(".parent");
most.create(function (add) {
    container.on("click", '.inner', add);
    return function () {
        return container.off("click",'.inner', add);
    };
})
.observe(function(e){
    return console.log(e.target.textContent)
});
```