'use strict'

const path = require('path')
const mergeTrees = require('broccoli-merge-trees')
const EmberVersionChecker = require('ember-cli-version-checker')

const StyleProcessor = require('./style-processor')

function StyleProcessorPlugin(optionsFn) {
	this.name = 'ember-cli-css-preprocess'
	this.ext = 'css'
	this.optionsFn = optionsFn
}

StyleProcessorPlugin.prototype.toTree = function(tree, inputPath, outputPath, inputOptions) {
	const options = Object.assign({}, this.optionsFn(), inputOptions)

	const paths = options.outputPaths
	const extensionDefault = options.extension ? options.extension : this.ext

	// http://stackoverflow.com/a/6582227/4202031
	const patternExtension =  /\.([0-9a-z]+)(?:[?#]|$)/i // Returns array [ '.css', 'css' ]

	const trees = []

	for (let inputFile in paths) {

		let extension = inputFile.match(patternExtension)
		let inputFileName = inputFile

		if(!extension) {
			inputFileName = `${inputFile}.${extensionDefault}`
		}

		const input = path.join(inputPath, inputFileName)
		const output = paths[inputFile]

		const styleProcessor = new StyleProcessor([tree], input, output, options)
		trees.push(styleProcessor)
	}

	return mergeTrees(trees)
}

module.exports = {
	name: 'ember-cli-css-preprocess',
	shouldSetupRegistryInIncluded: function() {
		let checker = new EmberVersionChecker(this)
		return checker.for('ember-cli').isAbove('0.2.0')
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
