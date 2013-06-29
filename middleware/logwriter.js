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
        logger = {
            /**
             * @name debug
             * @memberOf logger
             * @function
             * @param {String} message the message to write with a 'debug' level
             */
            debug   : function (message) {
                write('debug', '[Debug]', message);
            },
            /**
             * @name info
             * @memberOf logger
             * @function
             * @param {String} message the message to write with a 'info' level
             */
            info    : function (message) {
                write('info', '[Info]', message);
            },
            /**
             * @name warning
             * @memberOf logger
             * @function
             * @param {String} message the message to write with a 'warning' level
             */
            warning : function (message) {
                write('warning', '[Warning]', message);
            },
            /**
             * @name error
             * @memberOf logger
             * @function
             * @param {String} message the message to write with a 'error' level
             */
            error   : function (message) {
                write('error', '[Error]', message);
            }
        };
    /**
     * A logging utility
     * @name logger
     * @type {Object}
     * @memberOf req
     */
    return function logwriter(req, res, next) {
        res.log = logger;
        next();
    };
};
