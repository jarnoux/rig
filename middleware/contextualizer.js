/*jslint forin: true */

module.exports = function (options) {
    'use strict';
    /**
     * @name context
     * @type {Object}
     * @memberOf req
     * @description The running context of the request
     * 
     */
    return function contextualizer(req, res, next) {
        var key;
        req.context = {};
        // start by taking all the context configs
        req.context = options;
        next();
    };
};
