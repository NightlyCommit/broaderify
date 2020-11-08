# broaderify

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

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

```typescript
import * as Browserify from "browserify";
import broaderify from "broaderify";

Browserify()
    .transform(broaderify, {
        loaders: [{
            filter: /foo.js/,
            worker: (module, content, done) => {
                // do whatever you want with content
                done(content);
            }
        }]
    })
    .add('index.js');
```


## API

Read the [documentation](https://nightlycommit.github.io/broaderify) for more information.

## Configuration options:

* **global**: A boolean indicating if broaderify should be applied to node_modules modules.
* **loaders**: An array of loaders that will be tested against each module passed to broaderify. Each loader must be an object with at least the following properties:
    * filter: A [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp) instance that will be tested against the path of the module to determine if it should be transformed.
    * worker: A function that will be called for each module that needs transformation, with the following arguments:
        * module: The path of the module.
        * content: The content of the module - i.e. the source.
        * done: A function that needs to be called with the transformed source once the transformation is done.
        
## Recipes

### Injecting jQuery into Bootstrap 3

```typescript
import * as Browserify from "browserify";
import broaderify from "broaderify";

let bundle = browserify()
    .transform(broaderify, {
        global: true,
        loaders: [{
            filter: /node_modules\/bootstrap\/js\/(.*).js/,
            worker: (module, content, done) => {
                content = 'var jQuery = require(\'jquery\');' + content;

                done(content);
            }
        }]
    })
    .add('index.js');
```

### Injecting jQuery into a jQuery plugin

Let's take [parallax.js](http://matthew.wagerfield.com/parallax/) jQuery plugin as an example. It is a very good example because it makes the explicit assumption that jQuery is part of the *window* object:

```typescript
import * as Browserify from "browserify";
import broaderify from "broaderify";

let bundle = browserify()
    .transform(broaderify, {
        global: true,
        loaders: [{
            filter: /node_modules\/parallax-js\/source\/jquery.parallax.js/,
            worker: (module, content, done) => {
                content = content.replace('window.jQuery || window.Zepto', 'jQuery');
                content = 'var jQuery = require(\'jquery\');' + content;

                done(content);
            }
        }]
    })
    .add('index.js');
```

## Contributing

* Fork the main repository
* Code
* Implement tests using [tape](https://github.com/substack/tape)
* Issue a pull request keeping in mind that all pull requests must reference an issue in the issue queue

## License

Apache-2.0 © [Eric MORAND]()

[npm-image]: https://badge.fury.io/js/broaderify.svg
[npm-url]: https://npmjs.org/package/broaderify
[travis-image]: https://travis-ci.org/ericmorand/broaderify.svg?branch=master
[travis-url]: https://travis-ci.org/ericmorand/broaderify
[coveralls-image]: https://coveralls.io/repos/github/ericmorand/broaderify/badge.svg
[coveralls-url]: https://coveralls.io/github/ericmorand/broaderify