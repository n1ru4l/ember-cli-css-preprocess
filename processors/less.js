const deepMerge = require('deepmerge')

/**
 * A module for transforming file contents with less
 * @param {Object} less
 * @module less
 */

module.exports = function(less) {
	return function(content, processor, importPath) {
		const optionsConfig   = processor.options || {}
	    const optionsDefault  = { plugins: [], paths: [importPath] }
	    const options         = null

	    //Load plugins
	    if(processor.plugins) {
	        optionsDefault.plugins = processor.plugins.reduce(function(plugins, plugin) {
	            var pluginOptions = plugin.options || null
	            plugins.push(new plugin.module(pluginOptions))
	            return plugins;
	        }, []);
	    }

	    options = deepMerge({}, optionsDefault, optionsConfig)

	    options = deepMerge(options, optionsDefault)

	    return new Promise(function(res, rej) {
	        less.render(data, options, function(errLess, result) {
	            if(errLess) {

	                //Concat error message
	                var errMessage      = errLess.message + "\n" + errLess.extract[0]

	                //Transform postcss error to broccoli error
					var errBroccoli     = new Error(errMessage)
					errBroccoli.line    = errLess.line
					errBroccoli.column  = errLess.column

					return rej(errBroccoli)
	            }

	            return res(result.css)
	        })
	    })
	}
}
