const deepMerge = require('deepmerge')

/**
 * A module for transforming file contents with postcss
 * @param {Object} postcss
 * @module postcss
 */

module.exports = function(postcss) {
	return function(content, processor, importPath) {
		if(!processor.plugins) {
	        throw new Error('Please add plugins to your postcss-process!')
	    }

		var processOptions = {
			//We need this for some plugins (e.q. precss to find imports)
			from: 'app/styles/' + filename,
			to: 'styles/' //TODO: What do with this?
		}

	    if(processor.parser) {
			processOptions.parser = processor.parser;
	    }

		if(processor.syntax) {
			processOptions.syntax = processor.syntax;
	    }

	    //Wrap options in module
	    var postcssPlugins = processor.plugins.reduce(function(pluginArray, curPluginConf) {

	        if(typeof curPluginConf.module != 'function') {
	            throw new Error('One of your postcss plugins is not a module!')
	        }

	        var pluginOptions = curPluginConf.options || {}
	        pluginArray.push(curPluginConf.module(pluginOptions))

	        return pluginArray
	    }, [])

	    return new Promise(function(res, rej) {
	        postcss(postcssPlugins)
	        .process(data, processOptions)

	        .then(function(dataProcessed) {
	            return res(dataProcessed.css)
	        })

	        .catch(function(errPostCss) {
	            //Transform postcss error to broccoli error
				//TODO: Do postcss plugins all have different errorMessage properties?
				var errBroccoli= new Error(errPostCss.message ? errPostCss.message : errPostCss.originalMessage);
				errBroccoli.line    = errPostCss.lineNumber
				errBroccoli.column  = errPostCss.columnNumber

	            return rej(errBroccoli)
	        })
	    })
	}
}
