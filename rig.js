var path     = require('path'),
    Config   = require('lib/config'),
    Registry = require('middleware/registry'),
    Router   = require('lib/router'),
    express  = require('express'),
    Rig = function (options) {
        var that = this;

        this.app = express();

        // register all the middlewares
        this.registry = new Registry(new Config(options.config));
        this.registry.register(path.resolve(__dirname, 'middleware'));
        this.registry.register({
            'app.router'           : function () {return that.app.router; },
            'express.static'       : express.static.bind(null, __dirname + '/static'),
            'express.logger'       : express.logger,
            'express.query'        : express.query,
            'express.bodyParser'   : express.bodyParser,
            'express.cookieParser' : express.cookieParser,
            'express.session'      : express.session,
            'express.csrf'         : express.csrf,
            'express.errorHandler' : express.errorHandler,
            'rig.registry'  : registry.middleware.bind(registry)
        });

        this.router = new Router({
            registry: this.registry,
            routes  : options.routes
        });
        this.router.map(this.app);

        this.app.engine('.html', registry.get('middleware.hb-adapter'));
    };

Rig.prototype.getApp = function() {
    return this.app;
};

module.exports = Rig;
