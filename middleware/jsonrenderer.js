module.exports = function (options) {
    'use strict';
    options = options || [];

    return function (req, res, next) {
        /**
         * A glorified JSON.stringify
         * @name renderJSON
         * @methodOf req
         * @param  {Any}   json
         * @param  {Function} callback a {@code function (error, result)} called when rendering is finished
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
