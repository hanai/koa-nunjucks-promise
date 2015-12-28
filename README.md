# koa-nunjucks-promise

[![NPM version][npm-image]][npm-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]

nunjucks rendering middleware with promise for koa

## Installation

``` bash
$ npm install koa-nunjucks-promise
```

## Example

``` js
var views = require('koa-nunjucks-promise');

app.use(views('views', {
  ext: 'html',
  noCache: process.env.NODE_ENV === 'development',
  filters: {
    json: function(str) {
      return JSON.stringify(str, null, 2);
    }
  },
  globals: {
    version: 'v8.0.1'
  }
));

app.use(async function(ctx, next) {
  this.state = {
    title: 'app'
  };
  
  await ctx.render('user', {
    user: 'Cat'
  });
});
```

## API

#### `views([root, opts])`

* `root (__dirname)`: __dirname + where your views are located
* `opts`: these options go straight to [nunjucks](https://mozilla.github.io/nunjucks/api.html).
  - ext: extension of template file

## Debug

Set the `DEBUG` environment variable to `koa-nunjucks-promise` when starting your server.

``` bash
$ DEBUG=koa-nunjucks-promise
```

## License

[MIT](./license)

[npm-image]: https://img.shields.io/npm/v/koa-nunjucks-promise.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-nunjucks-promise
[david-image]: http://img.shields.io/david/hanai/koa-nunjucks-promise.svg?style=flat-square
[david-url]: https://david-dm.org/hanai/koa-nunjucks-promise
[license-image]: http://img.shields.io/npm/l/koa-nunjucks-promise.svg?style=flat-square
[license-url]: ./LICENSE