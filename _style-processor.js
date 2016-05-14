'use strict'

const CachingWriter = require('broccoli-caching-writer')
const mkdirp = require('mkdirp-promise')
const path = require('path')
const fs = require('fs-promise')
const co = require('co')

const loadProcessor = require('./_load-processor')

StyleProcessor.prototype = Object.create(CachingWriter.prototype)
StyleProcessor.prototype.constructor = StyleProcessor

function StyleProcessor(inputNodes, inputFile, outputFile, _options) {

	if (!(this instanceof StyleProcessor)) {
		return new StyleProcessor(inputNodes, inputFile, outputFile, _options)
	}

	CachingWriter.call(this, inputNodes, {
		annotation: _options.annotation
	})

	this._processors 	 = _options.processors
	this._inputFilePath  = `.${inputFile}`
	this._inputFileName  = path.basename(this._inputFilePath, `.${_options.ext}`) // base filename without extension
	this._outputFile     = outputFile

    //Import path for preprocessors that allow including other files
	this._importPath = '.' + path.dirname(inputFile)

	//Information which is passed to every single style processor
	this._fileInfo = {
		inputFile: this._inputFilePath,
		importPath: this._importPath,
		extension: _options.ext
	}
}

/**
 * Handles the fileContent transformation
 *
 * @returns {Promise}
 */
StyleProcessor.prototype.build = co.wrap(function * () {
	let fileContents = yield fs.readFile(this._inputFilePath, { encoding: 'utf8' })

	for(let i = 0; i < this._processors.length; i++) {
		const processor = this._processors[i]
		let _process = false
		if(processor.file === undefined) {
			_process = true
		} else if(processor.file === this._inputFileName) {
			_process = true
		} else if(processor.file instanceof []) {
			if(processor.file.indexOf(this._inputFileName) != -1) {
				_process = true
			}
		}

		if(_process) {
			const _processor = loadProcessor(processor.type)
			fileContents = yield _processor(fileContents, processor, this._fileInfo)
		}
	}

	const outputFile = path.join(this.outputPath, this._outputFile)
	const outputFileDir = path.dirname(outputFile)
	yield mkdirp(outputFileDir)

	yield fs.writeFile(outputFile, fileContents, {
		encoding: 'utf8'
	})

	return Promise.resolve()
})

module.exports = StyleProcessor
