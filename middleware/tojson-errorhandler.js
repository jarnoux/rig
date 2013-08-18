
module.exports = function (options) {
    'use strict';
    return function (err, req, res, next) {
        var type = err.name || err.constructor.name,
            status = options.statuses[type] || 500;

        res.log.error(err.stack);
        res.json(status, {
            type: type,
            status: status,
            message: err.message
        });
    };
};
