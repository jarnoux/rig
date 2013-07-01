/*jslint forin: true */

var e_validator = require('express-validator'),
    /**
     * @constructor
     * @description An error thrown by user input validation
     * @param  {Object} errors an object containing validation errors
     */
    ValidationError = function (errors) {
        'use strict';
        this.name    = 'ValidationError';
        this.params  = errors;
        this.message = JSON.stringify(errors, null, 4);
    };

ValidationError.prototype = new Error();
ValidationError.prototype.constructor = ValidationError;

module.exports = function (options) {
    'use strict';
    var myValidator = function (req, res, next) {
        var error,
            nextParam,
            nextAssertion,
            nextAssertMethods,
            nextAssertMethod,
            nextSanitization,
            nextSanitizeMethods,
            nextSanitizeMethod,
            routeValidation = options[req.route.path];

        for (nextParam in routeValidation) {

            nextSanitization    = req.sanitize(nextParam);
            nextSanitizeMethods = routeValidation[nextParam].sanitize;
            for (nextSanitizeMethod in nextSanitizeMethods) {
                nextSanitization[nextSanitizeMethod].apply(nextSanitization, nextSanitizeMethods[nextSanitizeMethod]);
            }

            nextAssertion       = req.assert(nextParam, routeValidation[nextParam].errorMessage);
            nextAssertMethods   = routeValidation[nextParam].assert;
            for (nextAssertMethod in nextAssertMethods) {
                nextAssertion[nextAssertMethod].apply(nextAssertion, nextAssertMethods[nextAssertMethod]);
            }
        }

        error = req.validationErrors(true);
        next(error && new ValidationError(error));
    };

    /**
     * @function
     * @name  validator
     * @param  {Request}   req  
     * @param  {Reqponse}   res  
     * @param  {Function} next
     */
    return function validator(req, res, next) {
        e_validator(req, res, myValidator.bind(null, req, res, next));
    };
};
