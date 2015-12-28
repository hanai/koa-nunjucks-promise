var request = require('supertest');
var render = require('../');
var should = require('chai').should();
var Koa = require('koa');

describe('koa-nunjucks-promise', function () {
    it('have a render method', done => {
        var app = new Koa();
        app.use(render())
            .use((ctx, next) => {
                ctx.render.should.be.a('function');
            });

        request(app.listen()).get('/').expect(404, done);
    });

    it('default to html', done => {
        var app = new Koa();
        app.use(render())
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
        app.use(render())
            .use(async (ctx, next) => {
                ctx.state.engine = 'nunjucks';
                await ctx.render('./fixtures/global-state');
            });

        request(app.listen()).get('/')
            .expect('Content-Type', /html/)
            .expect(/basic:nunjucks/)
            .expect(200, done);
    });
});