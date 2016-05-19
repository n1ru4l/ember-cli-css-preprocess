'use strict'
const path = require('path')
const merge = require('lodash.merge')
const mergeTrees = require('broccoli-merge-trees')
const StyleProcessor = require('./_style-processor')
const EmberVersionChecker = require('ember-cli-version-checker')

function StyleProcessorPlugin(optionsFn) {
	this.name = 'ember-cli-css-preprocess'
	this.ext = 'css'
	this.optionsFn = optionsFn
}

StyleProcessorPlugin.prototype.toTree = function(tree, inputPath, outputPath, inputOptions) {
	const options = merge({}, this.optionsFn(), inputOptions)

	const paths = options.outputPaths
	const extensionDefault = options.extension ? options.extension : this.ext

	// http://stackoverflow.com/a/6582227/4202031
	const patternExtension =  /\.([0-9a-z]+)(?:[\?#]|$)/i // Returns array [ '.css', 'css' ]

	const trees = Object.keys(paths).map(function(file) {

		let inputFileName = file
		let extension = file.match(patternExtension)

		if(!extension) {
			inputFileName = `${file}.${extensionDefault}`
		}

		const input = path.join(inputPath, inputFileName)
		const output = paths[file]
		return new StyleProcessor([tree], input, output, options)
	})

	return mergeTrees(trees)
}

module.exports = {
	name: 'ember-cli-css-preprocess',
	shouldSetupRegistryInIncluded: function() {
		return !EmberVersionChecker.isAbove(this, '0.2.0')
	},
	styleProcessorOptions: function() {
		// const env = process.env.EMBER_ENV
		const options = (this.app && this.app.options.styleProcessorOptions) || {}
		options.outputFile = options.outputFile || this.project.name() + '.css'
		options.projectRoot = this.app.project.root
		return options
	},
	setupPreprocessorRegistry: function(type, registry) {
		registry.add('css', new StyleProcessorPlugin(this.styleProcessorOptions.bind(this)))
	},
	included: function included(app) {
		this.app = app
		this._super.included.apply(this, arguments)

		if(this.shouldSetupRegistryInIncluded()) {
			this.setupPreprocessorRegistry('parent', app.registry)
		}
	}
}
