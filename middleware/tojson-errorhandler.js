
module.exports = function (options) {
    'use strict';
    return function (err, req, res, next) {
        var type = err.name || err.constructor.name,
            status = options.statuses[type] || 500;

        res.json(status, {
            type: type,
            status: status,
            message: err.message
        });
    };
};
