/*jslint nomen: true */

var path     = require('path'),
    Config   = require('./lib/config'),
    Router   = require('./lib/router'),
    Registry = require('./middleware/registry'),
    HBAdapter = require('./lib/hb-adapter'),
    express  = require('express'),
    /**
     * @constructor
     * @param  {Object} options
     * @param {String} options.config the path of the json file containing the configurations
     * @param {String} options.routes the path of the json file containing the routing configs
     */
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

        // special case for hb-adapter
        this.registry.register('lib.hb-adapter', HBAdapter);
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

        templateEngine = this.registry.get(options.templateEngine || 'lib.hb-adapter');
        if (templateEngine) {
            this.app.engine('.html', templateEngine);
        }
    };

Rig.prototype.engine = function () {
    'use strict';
    this.app.engine.apply(this.app, arguments);
};
/**
 * Configures and stores a resource into the registry
 * @param  {String} name the reference under which to register the resource. Will be used to lookup for configurations
 * @param  {Function} configurable a function that takes a configuration object and returns the resource to be registered
 */
Rig.prototype.register = function (name, configurable) {
    'use strict';
    this.registry.register(name, configurable);
};

/**
 * Configures the app to route specific requests to specific middlewares according to the route config file
 */
Rig.prototype.route = function () {
    'use strict';
    console.log('[Rig] Mapping routes with registered resources:');
    console.log(Object.keys(this.registry.get()));
    this.app.use(this.registry.middleware());
    this.router.map(this.app);
};

Rig.prototype.listen = function () {
    'use strict';
    this.app.listen.apply(this.app, arguments);
};

module.exports = Rig;
