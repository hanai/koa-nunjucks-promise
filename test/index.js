var request = require('supertest');
var views = require('../');
var should = require('chai').should();
var Koa = require('koa');

describe('koa-nunjucks-promise', function () {
    it('have a render method', done => {
        var app = new Koa();
        app.use(views())
            .use((ctx, next) => {
                ctx.render.should.be.a('function');
            });

        request(app.listen()).get('/').expect(404, done);
    });

    it('default to html', done => {
        var app = new Koa();
        app.use(views())
            .use(async (ctx, next) => {
                await ctx.render('./fixtures/basic');
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:html/)
            .expect(200, done);
    });

    it('set and render state', done => {
        var app = new Koa();
        app.use(views())
            .use(async (ctx, next) => {
                ctx.state.engine = 'nunjucks';
                await ctx.render('./fixtures/global-state');
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:nunjucks/)
            .expect(200, done);
    });

    it('set and render local', done => {
        var app = new Koa();
        app.use(views())
            .use(async (ctx, next) => {
                await ctx.render('./fixtures/global-state', {
                    engine: 'nunjucks'
                });
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:nunjucks/)
            .expect(200, done);
    });

    it('set option: root', done => {
        var app = new Koa();
        app.use(views('../test'))
            .use(async (ctx, next) => {
                ctx.state.engine = 'nunjucks';
                await ctx.render('./fixtures/global-state');
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:nunjucks/)
            .expect(200, done);
    });

    it('set option: ext', done => {
        var app = new Koa();
        app.use(views({ext: 'nunjucks'}))
            .use(async (ctx, next) => {
                ctx.state.engine = 'nunjucks';
                await ctx.render('./fixtures/ext');
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:nunjucks/)
            .expect(200, done);
    });

    it('set option: filters', done => {
        var app = new Koa();
        app.use(views({
                filters: {
                    second: function (arr) {
                        return arr[1];
                    }
                }
            }))
            .use(async (ctx, next) => {
                await ctx.render('./fixtures/filter', {
                    students: ['Tony', 'Frank', 'Jerry', 'Yuri']
                });
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/student: Frank/)
            .expect(200, done);
    });

    it('set option: filters', done => {
        var app = new Koa();
        app.use(views({
                globals: {
                    SITE_NAME: 'app'
                }
            }))
            .use(async (ctx, next) => {
                await ctx.render('./fixtures/global');
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/site: app/)
            .expect(200, done);
    });

    it('works with circular references in state', done => {
        var app = new Koa();
        app.use(views())
            .use(async (ctx, next) => {
                ctx.state = {
                    a: {},
                    app: app
                };

                ctx.state.a.a = ctx.state.a;

                await ctx.render('./fixtures/global-state', {
                    app: app,
                    b: ctx.state,
                    engine: 'nunjucks'
                });
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:nunjucks/)
            .expect(200, done);
    });

    it('merges global and local state ', done => {
        var app = new Koa();
        app.use(views())
            .use(async (ctx, next) => {
                ctx.state.engine = 'nunjucks';

                await ctx.render('./fixtures/state', {
                    type: 'basic'
                });
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:nunjucks/)
            .expect(200, done);
    });

    it('return to the next middleware if ctx.render is already defined', done => {
        var app = new Koa();
        app.use((ctx, next) => {
                ctx.render = true;
                return next();
            })
            .use(views())
            .use((ctx, next) => {
                ctx.body = 'hello';
                ctx.render.should.be.a('boolean');
            });

        request(app.listen()).get('/')
            .expect('hello')
            .expect(200, done)
    });
});