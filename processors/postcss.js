'use strict'

/**
 * A module for transforming file contents with postcss
 * @param {Object} postcss
 * @module postcss
 */

module.exports = function PostCSSProcessorInitializer(postcss) {
	return function PostCSSProcessor(content, processor, fileInfo) {
		return new Promise((res, rej) => {

			if(!processor.plugins) {

				const err = new Error('Please add plugins to your postcss-processor!')
				return rej(err)
			}

			const processOptions = {
				//We need this for some plugins (e.q. precss to find imports)
				from: fileInfo.inputFile,
				to: 'styles/' //TODO: What do with this?
			}

			if(processor.parser) {
				processOptions.parser = processor.parser
			}

			if(processor.syntax) {
				processOptions.syntax = processor.syntax
			}

			const plugins = []

			for (let plugin of processor.plugins) {

				if(plugin.module instanceof Function === false) {

					const err = new Error('One of your postcss plugins is not a module!')
					return rej(err)
				}

				const Module = plugin.module
				const options = plugin.options || {}

				plugins.push(new Module(options))
			}

			postcss(plugins)
				.process(content, processOptions)
				.then(dataProcessed => res(dataProcessed.css))
				.catch((errPostCSS) => {

					// Transform postCSS error to broccoli error
					const errBroccoli = new Error(errPostCSS.message)
					errBroccoli.line = errPostCSS.lineNumber
					errBroccoli.column = errPostCSS.columnNumber

					return rej(errBroccoli)
				})
		})
	}
}
