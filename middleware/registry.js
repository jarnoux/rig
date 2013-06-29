/*jslint nomen: true, forin: true, stupid: true, newcap: true */

var fs       = require('fs'),
    path     = require('path'),
    cwd      = process.cwd(),
    /**
     * @constructor
     * @param {Config} config the config containing the settings necessary to configure resources
     */
    Registry = function (config) {
        'use strict';
        this.__config__ = config;
        this.__resourceStore__ = {};
    };

/**
 * Configure and store a resource
 * @param  {String} name
 * @param  {Function} configurable
 * @throws {Error} If {@code typeof name} is not {@code 'object'} not {@code 'string'}
 */
Registry.prototype.register = function (name, configurable) {
    'use strict';
    var registry = this,
        nextName;

    // if only one argument and it's an object, load in batch
    // if it's a string, assume path and load each in the directory
    if (!configurable) {
        switch (typeof name) {
        case 'object':
            // only go down object litterals
            if (name.constructor === Object) {
                for (nextName in name) {
                    this.register(nextName, name[nextName]);
                }
            }
            break;
        case 'string':
            name = path.resolve(cwd, name);
            return fs.readdirSync(name).forEach(function (file) {
                registry._registerASingleResource(path.basename(name) + '.' + file, path.join(name, file));
            });
        default:
            throw new Error('expected an object or a string, but got ' + name + ' instead.');
        }
    } else {
        return this._registerASingleResource(name, configurable);
    }
};

/**
 * Retrieve a configured resource
 * @param  {String} path the 'dot-separated' path where to find the resource in the json-tree config
 * @return {Any} the configured resource
 */
Registry.prototype.get = function (path) {
    'use strict';
    if (!path) {
        return this.__resourceStore__;
    }
    return this.__resourceStore__[path];
};

/**
 * @private
 * @param  {String} name
 * @param  {Function} configurable
 */
Registry.prototype._registerASingleResource = function (name, configurable) {
    'use strict';
    var configuredResource,
        nextKey,
        nestedResource,
        resource;

    // we try to load named modules
    if (typeof configurable === 'string') {
        // if it's a file, remove the extention
        if (fs.statSync(configurable).isFile()) {
            name = name.substring(0, name.lastIndexOf('.'));
        }
        configurable = require(configurable);
    }
    // NOW if the configurable is configurable, try to do it
    if (typeof configurable === 'function') {
        try {
            configuredResource = this.__config__.ure(configurable, name);
        } catch (e) {
            // if (e instanceof this.__config__.ConfigurationError) {
                // not listed in the config
            // }
            // else it's probably a constructor trying to set an undefined "this", skip
            // console.log('skipping:', name);
            return;
        }
    }
    // here either configuredResource is something and we want it, or we want configurable
    resource = configuredResource || configurable;
    // if resource is an object litteral, register each of its members
    if (resource.constructor === Object) {
        for (nextKey in resource) {
            this._registerASingleResource(name + '.' + nextKey, resource[nextKey]);
        }
    } else {
        this.__resourceStore__[name] = resource;
    }
};

/**
 * retrieve a configuration object
 * @param  {String} path the 'dot-separated' path indicating where to find the configuration
 * @return {Object} the configuration
 */
Registry.prototype.getConfig = function (path) {
    'use strict';
    return this.__config__.get(path);
};

/**
 * A configurable for a registry middleware appending this instance to the {@code req} object
 * @return {Function} the registry middleware
 */
Registry.prototype.middleware = function registry() {
    'use strict';
    var self = this;
    /**
     * @name registry
     * @type {Registry}
     * @memberOf  req
     * @description a utility that allows easy configuration, storage and retrieval of resources
     */
    return function (req, res, next) {
        req.registry = self;
        next();
    };
};

module.exports = Registry;
