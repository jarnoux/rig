
module.exports = function (options) {
    'use strict';
	var counter = 0;
	return function (req, res, next) {
		req.id = counter++;
		next();
	}
};
