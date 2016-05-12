'use strict'

const CachingWriter       = require('broccoli-caching-writer')
const merge               = require('lodash.merge') // can we replace merge width deepMerge completely?
const mkdirp              = require('mkdirp-promise')
const path                = require('path')
const fs                  = require('fs-promise')
const includePathSearcher = require('include-path-searcher')
const co 				  = require('co')

const loadProcessor		  = require('./_load-processor')

StyleProcessor.prototype = Object.create(CachingWriter.prototype)
StyleProcessor.prototype.constructor = StyleProcessor

function StyleProcessor(inputNodes, inputFile, outputFile, _options) {

    if (!(this instanceof StyleProcessor)) {
        return new StyleProcessor(sourceTrees, inputFile, outputFile, _options)
    }

    CachingWriter.call(this, inputNodes, {
        annotation: _options.annotation
    });

	this._processors 	 = _options.processors
	this._inputFilePath  = this.inputPaths[0]
	this._inputFileName  = path.basename(this._inputFilePath, `.${_options.ext}`) // base filename without extension
    this._outputFile     = path.join(this.outputPath, outputFile)

    //Import path for preprocessors that allow including other files
	this._importPath = '.' + path.dirname(inputFile)

	this._outputFileName = path.join(this.outputPath, this.outputFile)
}

/**
 * Handles the fileContent transformartion
 * 
 * @returns {Promise}
 */
StyleProcessor.prototype.build = co.wrap(function * () {
	let fileContents = yield fs.readFile(this._inputFilePath, { encoding: 'utf8' })

	this._processors.forEach((processor) => {

		let process = false
		if(processor.file === undefined) {
			process = true
		} else if(processor.file === this_inputFileName) {
			process = true
		} else if(processor.file instanceof []) {
			if(processor.file.indexOf(this_inputFileName) != -1) {
				process = true
			}
		}

		if(process) {
			const _processor = loadProcessor(processorName.type)
			fileContents = yield _processor(fileContents, processor, this._importPath)
		}
	})

	const outputFileDir = path.dirname(this._outputFile)
	yield mkdirp(outputFileDir)

	yield fs.write(this._outputFile, fileContents, {
		encoding: 'utf8'
	})

	return Promise.resolve()
})
