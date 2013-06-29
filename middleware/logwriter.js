var fs = require('fs');

require('colors').setTheme({
    debug  : 'grey',
    info   : 'green',
    warning: 'yellow',
    error  : 'red'
});
module.exports = function (options) {
    'use strict';
    var out      = (options.out && fs.createWriteStream(options.out)) || process.stdout,
        logLevel = options.logLevel || 'error',
        write    = function (caller, prefix, message) {
            var line = [new Date().toISOString(), prefix, message, '\n'].join(' ');
            switch (caller) {
            case 'debug':
                if (logLevel === 'debug') {
                    out.write(line.debug);
                }
                break;
            case 'info':
                if (logLevel === 'debug' || logLevel === 'info') {
                    out.write(line.info);
                }
                break;
            case 'warning':
                if (logLevel !== 'error') {
                    out.write(line.warning);
                }
                break;
            case 'error':
                out.write(line.error);
                break;
            default:
                break;
            }
        },
        /**
         * A logging utility
         * @name log
         * @type {Object}
         * @memberOf req
         * @property {Function(String)} debug message the message to write with a 'debug' level
         * @property {Function(String)} info message the message to write with a 'info' level
         * @property {Function(String)} warning message the message to write with a 'warning' level
         * @property {Function(String)} error message the message to write with a 'error' level
         */
        logger = {
            debug   : function (message) {
                write('debug', '[Debug]', message);
            },
            info    : function (message) {
                write('info', '[Info]', message);
            },
            warning : function (message) {
                write('warning', '[Warning]', message);
            },
            error   : function (message) {
                write('error', '[Error]', message);
            }
        };
    return function logwriter(req, res, next) {
        res.log = logger;
        next();
    };
};
