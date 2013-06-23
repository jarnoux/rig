/*jslint nomen: true, stupid: true */
/**
 *  A configuration utility that allows easy synchronous and async access
 *  to configurations stored in a json file and can call/configure a 
 *  function with those configurations; 
 */

var fs     = require('fs'),
    Config = function (filePath) {
        'use strict';
        this._parsedConfig = JSON.parse(fs.readFileSync(filePath));
    },
    ConfigurationError = function (message) {
        'use strict';
        this.name = 'ConfigurationError';
        this.message = message;
    };

ConfigurationError.prototype = new Error();
ConfigurationError.prototype.constructor = ConfigurationError;

/**
 * Retieve the configuration object at the given path
 * @param  {String} path
 * @return {Object}
 */
Config.prototype.get = function (path) {
    'use strict';
    var config = this._parsedConfig,
        pathSegments,
        nextPathSegment;

    if (!path) {
        return config;
    }
    // if cached, return that
    if (this._parsedConfig[path]) {
        return this._parsedConfig[path];
    }
    pathSegments = path.split('.');
    for (nextPathSegment = 0; nextPathSegment < pathSegments.length; nextPathSegment += 1) {
        config = config && config[pathSegments[nextPathSegment]];
    }
    // cache for next time
    this._parsedConfig[path] = config;
    return config;
};

/**
 * Given a configurable and a path, call the configurable with the config stored
 * at the given path and returns the result
 * @param  {Function} configurable
 * @param  {String} path
 * @return {Any}
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
            (this._parsedConfig.hasOwnProperty(path) && configurable.length === 1)) {
        return configurable.call(null, options);
    }
    // if config expects more than one argument, skip
    throw new ConfigurationError((!options ? 'No' : 1) + ' config available at "' + path + '" yet configurable expects ' + configurable.length);
};

Config.prototype.ConfigurationError = ConfigurationError;

module.exports = Config;