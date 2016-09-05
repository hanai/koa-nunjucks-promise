var nunjucks = require('nunjucks');
var path = require('path');
var debug = require('debug')('koa-nunjucks-promise');

module.exports = function (root, opts) {
    var basePath = path.dirname(module.parent.filename);

    if (typeof root === 'object') {
        opts = root;
        root = opts.root || basePath;
    } else if (!root) {
        root = basePath;
    }

    root = path.resolve(basePath, root);

    opts = opts || {};

    var env = nunjucks.configure(root, opts);

    var ext = opts.ext || 'html';

    var filters = opts.filters || {};
    Object.keys(filters).forEach(f => {
        env.addFilter.apply(env, [f].concat(filters[f]));
    });

    var globals = opts.globals || {};
    Object.keys(globals).forEach(g => {
        env.addGlobal(g, globals[g]);
    });

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
            });
        };
        return next();
    }
};

