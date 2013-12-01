/*jslint nomen: true, stupid: true, plusplus: true */

var fs   = require('fs'),
    yaml = require('js-yaml'),
    /**
     * @constructor
     * @description Config parses json configuration files, resolves 'dot-separated' path names for retrieval of its configurations and allows easy configuration of correspondingly named resources.
     * @param  {String} filePath the path of the json configuration file
     */
    Config = function (filePath) {
        'use strict';
        this._parsedConfig = require(filePath);
        this._cachedConfig = {};
    },
    /**
     * @constructor
     * @description An error that is thrown when no configuration or an inadequate configuration is found.
     * @param  {String} message
     */
    ConfigurationError = function (message) {
        'use strict';
        this.name = 'ConfigurationError';
        this.message = message;
    };

ConfigurationError.prototype = new Error();
ConfigurationError.prototype.constructor = ConfigurationError;

/**
 * Retieve the configuration object at the given path
 * @param  {String} path the 'dot-separated' path to retrieve the config
 * @return {Object} the config object
 */
Config.prototype.get = function (path) {
    'use strict';
    var config = this._parsedConfig,
        pathSegments,
        nextPathSegment,
        defaultConfig,
        configKeys,
        k;

    if (!path) {
        return config;
    }
    // if cached, return that
    if (this._cachedConfig[path]) {
        return this._cachedConfig[path];
    }

    pathSegments = path.split('.');
    for (nextPathSegment = 0; nextPathSegment < pathSegments.length - 1; nextPathSegment += 1) {
        config = config && config[pathSegments[nextPathSegment]];
    }
    // catch defaults if config is an object
    if (config && config[pathSegments[nextPathSegment]] instanceof Object) {
        defaultConfig = config['*'];
    }
    // finish last step
    config = config && config[pathSegments[nextPathSegment]];

    // loop and override default properties if any
    if (defaultConfig) {
        configKeys = Object.keys(config || {});
        for (k = 0; k < configKeys.length; k++) {
            defaultConfig[configKeys[k]] = config[configKeys[k]];
        }
    }
    // cache
    this._cachedConfig[path] = defaultConfig || config;
    return this._cachedConfig[path];
};

/**
 * Given a configurable and a path, call the configurable with the config stored
 * at the given path and returns the result
 * @param  {Function(Object)} configurable returning a resource which closure contains {@code options}
 * @param  {String} path the path indicating where to retrieve the resource configuration
 * @return {Any} the result of calling {@linkcode configurable} with the config at the given {@code path}
 */
Config.prototype.ure = function (configurable, path) {
    'use strict';
    var options = this.get(path);
    // if not referenced, skip
    if (options === undefined) {
        throw new ConfigurationError('No config available for "' + path + '"');
    }
    // either we give null for no option expected or we expect at most one
    // either way the middleware should be listed in the config
    if ((options === null && !configurable.length) ||
            (this._cachedConfig.hasOwnProperty(path) && configurable.length === 1)) {
        if (options) {
            options.module = path;
        }
        return configurable.call(null, options);
    }
    // if config expects more than one argument, skip
    throw new ConfigurationError((!options ? 'No' : 1) + ' config available at "' + path + '" yet configurable expects ' + configurable.length);
};

Config.prototype.ConfigurationError = ConfigurationError;

module.exports = Config;