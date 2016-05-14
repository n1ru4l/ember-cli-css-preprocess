'use strict'
const deepMerge = require('deepmerge')

/**
 * A module for transforming file contents with node-sass
 * @param {Object} nodeSass
 * @module nodeSass
 */

module.exports = function(nodeSass) {
	return function(content, processor, fileInfo) {
		return new Promise((res, rej) => {

			var optionsDefault = {
				data: content,
				includePaths: [fileInfo.importPath]
			}

			var optionsConfig = processor.options || {}

			var options = deepMerge(optionsConfig, optionsDefault)

			nodeSass.render(options, function(errSass, result) {

				if(errSass) {
					//Transform sass error to broccoli error
					var errBroccoli     = new Error(errSass.message)
					errBroccoli.line    = errSass.line
					errBroccoli.column  = errSass.column

					return rej(errBroccoli)
				}

				return res(result.css)
			})
		})
	}
}
