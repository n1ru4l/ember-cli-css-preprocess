'use strict'

const CachingWriter = require('broccoli-caching-writer')

const mkdirp = require('mkdirp-promise')
const path = require('path')
const fs = require('fs-promise')
const co = require('co')

const isGlob = require('is-glob')
const minimatch = require('minimatch')

const loadProcessor = require('./load-processor')

StyleProcessor.prototype = Object.create(CachingWriter.prototype)
StyleProcessor.prototype.constructor = StyleProcessor

/**
 * @class StyleProcessor
 * @extends CachingWriter
 */
function StyleProcessor(inputNodes, inputFile, outputFile, _options) {

	if(!(this instanceof StyleProcessor)) {
		return new StyleProcessor(inputNodes, inputFile, outputFile, _options)
	}

	CachingWriter.call(this, inputNodes, {
		annotation: _options.annotation
	})

	this._projectRoot = _options.projectRoot
	this._processors = _options.processors

	this._inputFilePath = `.${inputFile}`
	this._inputFileDir = path.dirname(this._inputFilePath)
	this._inputFileName = path.relative(`${_options.projectRoot}/app/styles`, this._inputFilePath) // relative path
	this._outputFile = outputFile

	//Information which is passed to every single style processor
	this._fileInfo = {
		inputFile: this._inputFilePath,
		importPath: this._inputFileDir,
		extension: _options.ext
	}
}


/**
 * Handles the fileContent transformation
 *
 * @returns {Promise}
 */
StyleProcessor.prototype.build = co.wrap(function*() {
	let fileContents = yield fs.readFile(this._inputFilePath, {
		encoding: 'utf8'
	})

	for (let processor of this._processors) {

		if(this._checkProcess(processor.filter)) {
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

/**
 * Checks if the file should be processed by a processor filter
 *
 * @param {array|string} filter Array of String or String. Supports glob pattern.
 * @returns {boolean} process Process or not process file
 * @private
 */
StyleProcessor.prototype._checkProcess = function(filter) {

	if (!filter) {
		return true
	}

	const fileName = this._inputFileName

	if (isGlob(filter)) {
		return minimatch(fileName, filter)
	}

	if (typeof filter === 'string') {
		return (fileName === filter)
	}

	if (filter instanceof Array) {

		let _process = false

		for (let _filter of filter) {
			_process = this._checkProcess(_filter)
		}

		return _process
	}

	return false
}

module.exports = StyleProcessor
