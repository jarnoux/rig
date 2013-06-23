/*jslint forin: true */

module.exports = function (options) {
    'use strict';
    return function contextualizer(req, res, next) {
        var key;
        req.context = {};
        // start by taking all the context configs
        req.context = options;
        next();
    };
};
