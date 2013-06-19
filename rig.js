var path     = require('path'),
    Config   = require('./lib/config'),
    Router   = require('./lib/router'),
    Registry = require('./middleware/registry'),
    express  = require('express'),
    Rig = function (options) {
        var that = this;

        this.app = express();

        // register all the middlewares
        this.registry = new Registry(new Config(options.config));
        this.registry.register(path.resolve(__dirname, 'middleware'));
        this.registry.register({
            'middleware.router'      : function () {return that.app.router; },
            'middleware.static'      : express.static.bind(null, __dirname + '/static'),
            'middleware.logger'      : express.logger,
            'middleware.query'       : express.query,
            'middleware.bodyParser'  : express.bodyParser,
            'middleware.cookieParser': express.cookieParser,
            'middleware.session'     : express.session,
            'middleware.csrf'        : express.csrf,
            'middleware.errorHandler': express.errorHandler,
            'middleware.registry'    : registry.middleware.bind(registry)
        });

        this.router = new Router({
            registry: this.registry,
            routes  : options.routes
        });

        this.app.engine('.html', registry.get('middleware.hb-adapter'));
    };

Rig.prototype.register = function (name, resource) {
    this.registry.register(name, resource);
};

Rig.prototype.map = function () {
    this.router.map(this.app);
};

module.exports = Rig;
