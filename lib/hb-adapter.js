/*jslint nomen: true */
var handlebars       = require('handlebars'),
    fs               = require('fs'),
    templatesCache   = {},
    stripSpaceInHTML = function (html) {
        'use strict';
        // remove spaces and carriage returns
        html = html.replace(/([\s\n]*)(<.+>)[\s\n]*/gm, function () {
            return arguments[2];
        });
        // remove comments
        return html.replace(/<!--(.*?)-->/gm, '');
    };

module.exports = function (options) {
    'use strict';

    /**
     * A caching, Express.js template engine glue for handlebars.
     * @name hb_adapter
     * @function
     * @param  {String}   path the path of the template file to render
     * @param  {Object}   templateData the data to inject into the template
     * @param  {Function(Error, String)} callback called upon completion
     */
    return function hb_adapter(path, templateData, callback) {
        var template = templatesCache[path],
            render   = function (template, data, callback) {
                var result;
                try {
                    result = template(data);
                    if (options.minifyHtml) {
                        result = stripSpaceInHTML(result);
                    }
                    callback(null, result);
                } catch (e) {
                    callback(e);
                }
            };
        if (!template) {
            fs.readFile(path, function (err, data) {
                if (err) {
                    callback(err);
                }
                templatesCache[path] = handlebars.compile(data.toString());
                render(templatesCache[path], templateData, callback);
            });
        } else {
            render(template, templateData, callback);
        }
    };
};
