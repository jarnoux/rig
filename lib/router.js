/*jslint nomen: true, forin: true */

var Config   = require('./config'),
    /**
     * @constructor
     * @description Router processes the routing configuration and maps middleware to routes
     * @param {Object} options
     * @param {Registry} options.registry the registry containing the middleware to route
     * @param {String} options.routes the path to the routes file
     */
    Router   = function (options) {
        'use strict';
        this._registry = options.registry;
        this._routesConfigs = new Config(options.routes);
    };

/**
 * Calls Express routing functions on the given app according to the registry and routes
 * @param  {Function} app the app to route
 * @throws {Error} If a resource is not available for a given route
 */
Router.prototype.map = function (app) {
    'use strict';
    var routes = this._routesConfigs.get(),
        router = this,
        nextRoute,
        verb,
        crtMiddleware,
        use    = function (middleware) {
            app.use(router._registry.get(middleware));
        };
    try {
        for (nextRoute in routes) {
            if (nextRoute === '') {
                routes[nextRoute].forEach(use);
            } else {
                for (verb in routes[nextRoute]) {
                    app[verb](nextRoute, routes[nextRoute][verb].map(this._registry.get.bind(this._registry)));
                }
            }
        }
    } catch (e) {
        console.error('Could not map ' + crtMiddleware + ' to route ' + ((verb && verb.toUpperCase()) || '') + ' "' + nextRoute +
            '". Most likely your routes and/or middleware are misconfigured');
        throw e;
    }
};

module.exports = Router;
