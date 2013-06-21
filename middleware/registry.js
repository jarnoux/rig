/*jslint nomen: true, forin: true, stupid: true, newcap: true */
/**
 *  A registry that configures resources and uniformizes retrieval.
 */

var fs = require('fs'),
    path = require('path'),
    Registry = function (config) {
        'use strict';
        this.__config__ = config;
        this.__resourceStore__ = {};
    };

Registry.prototype.register = function (name, resource) {
    'use strict';
    var registry = this,
        nextName;

    // if only one argument and it's an object, load in batch
    // if it's a string, assume path and load each in the directory
    if (!resource) {
        switch (typeof name) {
        case 'object':
            for (nextName in name) {
                this.register(nextName, name[nextName]);
            }
            break;
        case 'string':
            return fs.readdirSync(name).forEach(function (file) {
                registry._registerASingleResource(path.basename(name) + '.' + file, path.join(name, file));
            });
        default:
            throw new Error('expected an object or a string, but got ' + name + ' instead.');
        }
    } else {
        return this._registerASingleResource(name, resource);
    }
};

Registry.prototype.get = function (name) {
    'use strict';
    if (!name) {
        return this.__resourceStore__;
    }
    return this.__resourceStore__[name];
};

Registry.prototype._registerASingleResource = function (name, resource) {
    'use strict';
    var configuredResource,
        nextKey,
        nestedResource;

    // we try to load named modules
    if (typeof resource === 'string') {
        // if it's a file, remove the extention
        if (fs.statSync(resource).isFile()) {
            name = name.substring(0, name.lastIndexOf('.'));
        }
        resource = require(resource);
    }
    // NOW if the resource is configurable, try to do it
    if (typeof resource === 'function') {
        try {
            configuredResource = this.__config__.ure(resource, name);
        } catch (e) {
            // if (e instanceof this.__config__.ConfigurationError) {
                // not listed in the config
            // }
            // else it's probably a constructor trying to set an undefined "this", skip
            // console.log('skipping:', name);
            return;
        }
    }
    // here either configuredResource is something and we want it, or we want resource
    resource = configuredResource || resource;
    // if resource is an object litteral, register each of its members
    if (resource.constructor === Object) {
        for (nextKey in resource) {
            this._registerASingleResource(name + '.' + nextKey, resource[nextKey]);
        }
    } else {
        this.__resourceStore__[name] = resource;
    }
};

Registry.prototype.getConfig = function (name) {
    'use strict';
    return this.__config__.get(name);
};
Registry.prototype.middleware = function registry() {
    'use strict';
    var self = this;
    return function (req, res, next) {
        req.registry = self;
        next();
    };
};

module.exports = Registry;
