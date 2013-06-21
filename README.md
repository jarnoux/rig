rig.js
======

A barepipe platform for node webapps. Rig is a set of middlewares and libraries for webapps based on Express. Considering that performance and quality are very much a matter of clarity, emphasis is made on conciseness of the code and good, reusable design that makes (some) sense.

Example
-------
```javascript
/*jslint nomen: true*/

var path = require('path'),
    Rig  = require('rig'),
    rig  = new Rig({
        config: 'config.json',
        routes: 'routes.json'
    });

rig.register(path.resolve(__dirname, 'controllers'));
rig.register(path.resolve(__dirname, 'middleware'));
rig.register(path.resolve(__dirname, 'models'));

rig.map();

rig.app.listen(3030);
console.log('app listening on port', 3030);
```

That's all there is to a webapp. All the logic happens in the controllers, models and [Express](http://expressjs.com/) middleware (the resources).  
Configuring these resources is dead easy and happens in ```config.json```.  
How to pipe (route) all these resources is barely harder and happens in ```routes.json```.

Resources
---------
As an simple approach, a resource can be an object or a function returned by calling a configurer function. For example an [Express](http://expressjs.com/) middleware:
```javascript
module.exports = function helloWorldConfigurer(config) {
  return function helloWorld(req, res, next) {
    console.log('Hello World!!');
    next();
  };
}
```
or a model:
```javascript
var UselessClass = function () {};
function uselessModelConfigurer(config) {
  return new UselessClass();
}
```
or a controller:
```javascript
module.exports = function uselessControllerConfigurer(config) {
  return function uselessController(req, res, done) {
    done(null);
  };
}
```
Let's stop for a minute on the controller.  
Notice how (unlike a middleware) the ```done``` callback is a regular node-fashioned callback:
```javascript
function (err, result)
```
When it is done, the controller passes its error and/or result to the view with ```done```. Easy!  
  
All the above configurers will be called by Rig with the appropriate configuration object.
Notice how the [closure](http://en.wikipedia.org/wiki/Closure_(computer_science)) in the middleware and controller allows them to access the ```config``` object even after the ```return``` statement has been executed.


