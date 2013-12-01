/*jslint nomen: true */

var path     = require('path'),
    Config   = require('./lib/config'),
    Router   = require('./lib/router'),
    Registry = require('./lib/registry'),
    HBAdapter = require('./lib/hb-adapter'),
    express  = require('express'),

    /**
     * @constructor
     * @param {Object} options
     * @param {String} options.config the path of the json file containing the configurations
     * @param {String} options.routes the path of the json file containing the routing configs
     */
    Rig = function (options) {
        'use strict';
        var that = this,
            cwd  = process.cwd(),
            staticPath,
            templateEngine;

        this.app = express();

        // register all the middlewares
        Rig.registry = new Registry(new Config(path.resolve(cwd, options.config)));
        Rig.registry.register(path.resolve(__dirname, 'middleware'));

        // special case for static relative path
        staticPath = Rig.registry.getConfig('middleware.static');
        if (staticPath) {
            staticPath = path.resolve(cwd, staticPath);
        }

        // special case for hb-adapter
        Rig.registry.register('lib.hb-adapter', HBAdapter);
        Rig.registry.register({
            'middleware.router'        : function () {return that.app.router; },
            'middleware.static'        : express.static.bind(null, staticPath),
            'middleware.logger'        : express.logger,
            'middleware.query'         : express.query,
            'middleware.bodyParser'    : express.bodyParser,
            'middleware.cookieParser'  : express.cookieParser,
            'middleware.session'       : express.session,
            'middleware.csrf'          : express.csrf,
            'middleware.errorHandler'  : express.errorHandler,
            'middleware.compress'      : express.compress,
            'middleware.basicAuth'     : express.basicAuth,
            'middleware.json'          : express.json,
            'middleware.urlencoded'    : express.urlencoded,
            'middleware.multipart'     : express.multipart,
            'middleware.timeout'       : express.timeout,
            'middleware.cookieSession' : express.cookieSession,
            'middleware.methodOverride': express.methodOverride,
            'middleware.responseTime'  : express.responseTime,
            'middleware.staticCache'   : express.staticCache,
            'middleware.directory'     : express.directory,
            'middleware.vhost'         : express.vhost,
            'middleware.favicon'       : express.favicon,
            'middleware.limit'         : express.limit
        });

        this.router = new Router({
            registry: Rig.registry,
            routes  : options.routes
        });

        templateEngine = Rig.registry.get(options.templateEngine || 'lib.hb-adapter');
        if (templateEngine) {
            this.app.engine('.html', templateEngine);
        }

        // If we have the resources, we're good to go!
        if (options.resources) {
            if (!(options.resources instanceof Array)) {
                throw new Error('The the Rig constructor expects an Array in the "resource" parameter.');
            }
            options.resources.map(this.register);
            this.route();
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
    Rig.registry.register(name, configurable);
};

/**
 * Configures the app to route specific requests to specific middlewares according to the route config file
 */
Rig.prototype.route = function () {
    'use strict';
    console.log('[Rig] Mapping routes with registered resources:');
    console.log(Object.keys(Rig.registry.get()));
    this.router.map(this.app);
};

Rig.prototype.listen = function () {
    'use strict';
    this.app.listen.apply(this.app, arguments);
};

module.exports = Rig;
