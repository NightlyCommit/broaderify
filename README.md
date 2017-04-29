# broaderify

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

All-around transform for Browserify.

## Installation

```bash
npm install broaderify
```

## Motivation

The initial motivation comes from the need to inject dependencies into modules that don't import them by themselves - [bootstrap 3](http://getbootstrap.com/) for example, and by the flawed approach used by [browserify-shim](https://github.com/thlorenz/browserify-shim) to deal with that problem:

* Pollution of the global scope since browserify-shim is unable to inject dependency in the scope of the dependent module
* Configuration in package.json *only* - a thing that makes browserify-shim stands apart from every other Browserify transforms and implies having Browserify configuration splits in two different places just because of browserify-shim

Broaderify adopts a very similar strategy to [webpack](https://webpack.github.io/docs/) loaders: it allows full source transformation control based on module name filtering.
 
## Usage

Broaderify is a middleware-only transform for now. There is currently no way to use broaderify in the command-line - but it *is* on the road-map.

### Example

```javascript
let browserify = require('browserify');
let broaderify = require('broaderify');

let bundle = browserify()
    .transform(broaderify, {
        loaders: [
            {
                filter: /foo.js/,
                worker: function(module, content, done) {
                    // do whatever you want with content
                    done(content);
                }
            }
        ]
    })
    .add('index.js');
```

### Configuration options:

* loaders: An array of loaders that will be tested against each module passed to broaderify. Each loader must be an object with at least the following properties:
    * filter: A [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) instance that will be tested against the path of the module to determine if it should be transformed.
    * worker: A function that will be called for each module that needs transformation, with the following arguments:
        * module: The path of the module.
        * content: The content of the module - i.e. the source.
        * done: A function that needs to be called with the transformed source once the transformation is done.
 
## Road-map:

* Add support for function to be used as filter
* Add command-line support

## Recipes

### Injecting jQuery into Bootstrap 3

```javascript
let browserify = require('browserify');
let broaderify = require('broaderify');

let bundle = browserify()
    .transform(broaderify, {
        global: true,
        loaders: [
            {
                filter: /node_modules\/bootstrap\/js\/(.*).js/,
                worker: function(module, content, done) {
                    content = 'var jQuery = require(\'jquery\');' + content;

                    done(content);
                }
            }
        ]
    })
    .add('index.js');
```

### Injecting jQuery into a jQuery plugin

Let's take [parallax.js](http://matthew.wagerfield.com/parallax/) jQuery plugin as an example. It is a very good example because it makes the explicit assumption that jQuery is part of the *window* object:

```javascript
let browserify = require('browserify');
let broaderify = require('broaderify');

let bundle = browserify()
    .transform(broaderify, {
        global: true,
        loaders: [
            {
                filter: /node_modules\/parallax-js\/source\/jquery.parallax.js/,
                worker: function (module, content, done) {
                    content = content.replace('window.jQuery || window.Zepto', 'jQuery');
                    content = 'var jQuery = require(\'jquery\');' + content;

                    done(content);
                }
            }
        ]
    })
    .add('index.js');
```

## Contributing

* Fork the main repository
* Code
* Implement tests using [node-tap](https://github.com/tapjs/node-tap)
* Issue a pull request keeping in mind that all pull requests must reference an issue in the issue queue

## License

Apache-2.0 © [Eric MORAND]()

[npm-image]: https://badge.fury.io/js/broaderify.svg
[npm-url]: https://npmjs.org/package/broaderify
[travis-image]: https://travis-ci.org/ericmorand/broaderify.svg?branch=master
[travis-url]: https://travis-ci.org/ericmorand/broaderify
[daviddm-image]: https://david-dm.org/ericmorand/broaderify.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/ericmorand/broaderify
[coveralls-image]: https://coveralls.io/repos/github/ericmorand/broaderify/badge.svg
[coveralls-url]: https://coveralls.io/github/ericmorand/broaderify