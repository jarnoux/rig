/*jslint forin: true, nomen: true */

var async    = require('async'),
    Rig      = require('../rig.js'),
    registry = Rig.registry,
    stupidController = function (req, res, done) {
        done();
    };

module.exports = function (options) {
    'use strict';
    var dispatchPlan = function (plan, req, res, planDone) {
            var controller,
                key,
                toFlushInOrder,
                expandedPlan,
                retentionPool = {};

            if (typeof plan === 'string') {
                expandedPlan = options.details[plan];

                if (expandedPlan instanceof Array) {
                    return dispatchPlan(expandedPlan, req, res, planDone);
                }

                // if there is no controller, just render the static template with nothing
                controller = registry.get('controllers.' + plan);
                if (!controller) {
                    controller = stupidController;
                    console.warn('[Dispatcher] Cannot find resource controllers.' + plan + ', rendering corresponding view as static.');
                }

                if (expandedPlan instanceof Object) {
                    for (key in expandedPlan) {
                        retentionPool[key] = dispatchPlan.bind(null, expandedPlan[key], req, res);
                    }
                    retentionPool[plan] = controller.bind(null, req, res);
                    return async.parallel(retentionPool, function (err, preRenderedBits) {
                        var key;
                        for (key in preRenderedBits[plan]) {
                            preRenderedBits[key] = preRenderedBits[plan][key];
                        }
                        preRenderedBits._csrf = req.session._csrf;
                        return res.render(plan + '.html', preRenderedBits, planDone);
                    });
                }

                return controller(req, res, function renderResult(err, result) {
                    if (err) {
                        return planDone(err);
                    }
                    result = result || {};
                    result._csrf = req.session._csrf;
                    return res.render(plan + '.html', result, planDone);
                });
            }

            if (plan instanceof Array) {
                toFlushInOrder = plan.concat();

                return async.each(plan, function dispatchAndSchedule(subplan, subplanDone) {
                    dispatchPlan(subplan, req, res, function scheduleRendered(err, html) {
                        if (err) {
                            return subplanDone(err);
                        }
                        retentionPool[subplan] = html;
                        while (retentionPool.hasOwnProperty(toFlushInOrder[0])) {
                            res.write(retentionPool[toFlushInOrder.shift()] || '');
                        }
                        return subplanDone();
                    });
                }, planDone);
            }
        };

    /**
     * @name req
     * @type {Object}
     * @global
     * @namespace
     * @description  the request object passed to every middleware and controller as a first argument
     */
    /**
     * @name res
     * @type {Object}
     * @global
     * @namespace
     * @description the response object passed to every middleware and controller as a second argument
     */
    return function dispatcher(req, res, next) {
        var h,
            reqPath = req.route.path;
        // read the plan from the options given the matched route and method
        req.plan = options.plans[reqPath] &&
            (options.plans[reqPath][req.route.method] || options.plans[reqPath].all);
        if (!req.plan) {
            return next(new Error('No plan for route ' + reqPath));
        }
        for (h in options.headers[reqPath]) {
            res.setHeader(h, options.headers[reqPath][h]);
        }
        // initiate the recursive dispatch of the plan
        return dispatchPlan(req.plan, req, res, function done(err, result) {
            if (!err) {
                return res.end(result);
            }
            next(err);
        });
    };
};
