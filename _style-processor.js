'use strict'

const CachingWriter = require('broccoli-caching-writer')
const mkdirp = require('mkdirp-promise')
const path = require('path')
const fs = require('fs-promise')
const co = require('co')

const isGlob = require('is-glob')
const minimatch = require('minimatch')

const loadProcessor = require('./_load-processor')

StyleProcessor.prototype = Object.create(CachingWriter.prototype)
StyleProcessor.prototype.constructor = StyleProcessor

function StyleProcessor( inputNodes, inputFile, outputFile, _options ) {
	if ( !( this instanceof StyleProcessor ) ) {
		return new StyleProcessor( inputNodes, inputFile, outputFile, _options )
	}

	CachingWriter.call( this, inputNodes, {
		annotation: _options.annotation
	})

	this._projectRoot = _options.projectRoot
	this._processors = _options.processors
	this._inputFilePath = `.${inputFile}`
	this._inputFileName = path.relative( `${_options.projectRoot}/app/styles`, this._inputFilePath ) // relative path
	this._outputFile = outputFile

	//Import path for preprocessors that allow including other files
	this._importPath = '.' + path.dirname( inputFile )
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
 * Check if a file matches a filter
 *
 * @param {array|string} filter Array of String or String. Supports glob pattern.
 * @returns {boolean} _process
 */
StyleProcessor.prototype._checkProcess = function(filter) {
	let _process = false
	const fileName = this._inputFileName

	if(filter === undefined) {
		_process = true
	} else if(filter instanceof String) {
		if(isGlob(filter)) {
			_process = minimatch(fileName, filter)
		} else if(fileName === filter) {
			_process = true
		}
	} else if(filter instanceof Array) {
		filter.forEach((filter) => {
			if(isGlob(filter)) {
				_process = minimatch(fileName, filter)
			} else if(fileName === filter) {
				_process = true
			}
		})
	}

	return _process
}

module.exports = StyleProcessor
