module.exports = function (options) {
    'use strict';
    options = options || [];

    return function (req, res, next) {
        /**
         * A glorified JSON.stringify
         * @name renderJSON
         * @function
         * @memberOf req
         * @param {Any}   json
         * @param {Function(Error, String)} callback called when rendering is finished
         */
        req.renderJSON = function (json, callback) {
            try {
                callback(null, JSON.stringify.bind(null, json).apply(null, options));
            } catch (e) {
                callback(e);
            }
        };
        next();
    };
};
