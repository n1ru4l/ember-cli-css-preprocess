'use strict'
const deepMerge = require('deepmerge')

/**
 * A module for transforming file contents with less
 * @param {Object} less
 * @module less
 */

module.exports = function LessProcessorInitializer(less) {
	return function LessProcessor(content, processor, fileInfo) {
		return new Promise(function(res, rej) {

			const optionsConfig = processor.options || {}
			const optionsDefault = {
				plugins: [],
				paths: [fileInfo.importPath]
			}

			let options = null

			//Load plugins
			if(processor.plugins) {
				processor.plugins.forEach((plugin) => {
					const Module = plugin.module
					const pluginOptions = plugin.options || null
					optionsDefault.plugins.push(new Module(pluginOptions))
				})
			}

			options = deepMerge(optionsDefault, optionsConfig)
			options = deepMerge(options, optionsDefault)

			less.render(content, options, function(errLess, result) {
				if(errLess) {
					//Concat error message
					var errMessage      = `${errLess.message}\n${errLess.extract[0]}`
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
