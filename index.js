'use strict'
const path                = require('path')
const merge               = require('lodash.merge')
const mergeTrees          = require('broccoli-merge-trees')
const StyleProcessor      = require('./_style-processor')
const EmberVersionChecker = require('ember-cli-version-checker')

function StyleProcessorPlugin(optionsFn) {
    this.name = 'ember-cli-css-preprocess'

    this.ext = 'css'
    this.optionsFn = optionsFn
}

StyleProcessorPlugin.prototype.toTree = function(tree, inputPath, outputPath, inputOptions) {
    var options = merge({}, this.optionsFn(), inputOptions)

    var paths = options.outputPaths
    var ext = options.extension ? options.extension : this.ext

    var trees = Object.keys(paths).map(function(file) {
        var input = path.join(inputPath, file +  '.' + ext)
        var output = paths[file]

        return new StyleProcessor([tree], input, output, options);
    })

    return mergeTrees(trees)
}

module.exports = {
    name: 'ember-cli-css-preprocess',
    shouldSetupRegistryInIncluded: function() {
        return !EmberVersionChecker.isAbove(this, '0.2.0')
    },
    styleProcessorOptions: function() {
        var env     = process.env.EMBER_ENV
        var options = (this.app && this.app.options.styleProcessorOptions) || {}

        options.outputFile = options.outputFile || this.project.name() + '.css'

        return options
    },
    setupPreprocessorRegistry: function(type, registry) {
		registry.add('css', new StyleProcessorPlugin(this.styleProcessorOptions.bind(this)))
    },
    included: function included(app) {
        this.app = app

        this._super.included.apply(this, arguments)

        if (this.shouldSetupRegistryInIncluded()) {
            this.setupPreprocessorRegistry('parent', app.registry)
        }
    }
}
