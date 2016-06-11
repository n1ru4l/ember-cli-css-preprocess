'use strict'
const deepMerge = require('deepmerge')

/**
 * A module for transforming file contents with node-sass
 * @param {Object} nodeSass
 * @module nodeSass
 */

module.exports = function NodeSassProcessorInitializer(nodeSass) {
	return function NodeSassProcessor(content, processor, fileInfo) {
		return new Promise((res, rej) => {

			const optionsDefault = {
				data: content,
				includePaths: [fileInfo.importPath],
				file: fileInfo.inputFile
			}

			const optionsSourcemap = {
				sourceMapEmbed: true,
				sourceMapContents: true,
				sourceMap: true
			}

			const optionsConfig = processor.options || {}

			let options = deepMerge(optionsConfig, optionsDefault)

			if(processor.sourcemaps === true) {
				options = deepMerge(options, optionsSourcemap)
			}

			nodeSass.render(options, (errSass, result) => {

				if(errSass) {
					//Transform sass error to broccoli error
					const errBroccoli     = new Error(errSass.message)
					errBroccoli.line    = errSass.line
					errBroccoli.column  = errSass.column

					return rej(errBroccoli)
				}

				return res(result.css.toString())
			})
		})
	}
}
