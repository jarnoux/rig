
module.exports = function (options) {
	var counter = 0;
	return function(req, res, next) {
		req.id = counter++;
		next();
	}
};
