var nunjucks = require('nunjucks');
var path = require('path');
var debug = require('debug')('koa-nunjucks-promise');

module.exports = function (root, opts) {
    var basePath = path.dirname(module.parent.filename);
    root = root || basePath;
    root = path.resolve(basePath, root);

    opts = opts || {};

    var env = nunjucks.configure(root, opts);

    var ext = opts.ext || 'html';

    var filters = opts.filters || {};
    for (var f in filters) {
        if (filters.hasOwnProperty(f)) env.addFilter(f, filters[f]);
    }

    var globals = opts.globals || {};
    for (var g in globals) {
        if (globals.hasOwnProperty(g)) env.addGlobal(g, globals[g]);
    }

    return function (ctx, next) {
        if (ctx.render) return next();
        ctx.render = function (view, locals) {
            locals = locals || {};
            var state = ctx.state || {};
            var context = Object.assign({}, state, locals);

            debug('render %s with %j', view, context);
            return new Promise(function (resolve, reject) {
                var name = view + '.' + ext;
                env.render(name, context, function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            }).then(function (html) {
                ctx.body = html;
            }).catch(function (error) {
                console.error(error);
            });
        };
        return next();
    }
};