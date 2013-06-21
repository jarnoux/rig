/*jslint nomen: true */

var path     = require('path'),
    Config   = require('./lib/config'),
    Router   = require('./lib/router'),
    Registry = require('./middleware/registry'),
    express  = require('express'),
    Rig = function (options) {
        'use strict';
        var that = this,
            staticPath,
            templateEngine;

        this.app = express();

        // register all the middlewares
        this.registry = new Registry(new Config(options.config));
        this.registry.register(path.resolve(__dirname, 'middleware'));

        // special case for static relative path
        staticPath = this.registry.getConfig('middleware.static');
        if (staticPath) {
            staticPath = path.resolve(process.cwd(), staticPath);
        }

        this.registry.register({
            'middleware.router'      : function () {return that.app.router; },
            'middleware.static'      : express.static.bind(null, staticPath),
            'middleware.logger'      : express.logger,
            'middleware.query'       : express.query,
            'middleware.bodyParser'  : express.bodyParser,
            'middleware.cookieParser': express.cookieParser,
            'middleware.session'     : express.session,
            'middleware.csrf'        : express.csrf,
            'middleware.errorHandler': express.errorHandler
        });

        this.router = new Router({
            registry: this.registry,
            routes  : options.routes
        });

        templateEngine = this.registry.get(options.templateEngine || 'middleware.hb-adapter');
        if (templateEngine) {
            this.app.engine('.html', templateEngine);
        }
    };

Rig.prototype.register = function (name, resource) {
    'use strict';
    this.registry.register(name, resource);
};

Rig.prototype.route = function () {
    'use strict';
    console.log('[Rig] Mapping routes with registered resources:');
    console.log(Object.keys(this.registry.get()));
    this.app.use(this.registry.middleware());
    this.router.map(this.app);
};

module.exports = Rig;
