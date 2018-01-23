'use strict'
const compatibleProcessors = require('./package').peerDependencies
const semver = require('semver')
const finder = require('find-package-json')

/**
 * A module for loading a style processor
 * @module loadProcessor
 */

/**
 * Loads a module in 3 Steps.
 * 1. Check if module is compatible
 * 1. Check if module is installed
 * 2. Check if module version is compatible
 * 3. Load the module
 *
 * @private
 * @param {String} moduleName
 * @returns {Promise} processor
 */

function _loadModule(moduleName) {
	let modulePath
	// Check if module exists
	try {
		modulePath = require.resolve(moduleName)
	} catch (err) {
		switch (err.code) {
		case 'MODULE_NOT_FOUND':
			const error = new Error(`Processor ${moduleName} not found. Please install it first (npm install ${moduleName} --save-dev)`)
			error.code = 'MODULE_NOT_INSTALLED'
			throw error
		default:
			throw err
		}
	}

	//Check if module version is supported
	const f = finder(modulePath)
	const moduleVersion = f.next().value.version
	const compatibleVersion = compatibleProcessors[moduleName]

	if(!semver.satisfies(moduleVersion, compatibleVersion)) {
		const error = new Error(`Processor ${moduleName} (${moduleVersion}) is not compatible. Required version: ${compatibleVersion}`)
		error.code = 'MODULE_NOT_COMPATIBLE'
		throw error
	}

	return require(moduleName)
}

/**
 * Loads a processor
 *
 * @private
 * @param {String} processorName
 * @returns {Function} processor
 */
function _loadProcessor(processorName) {
	const compatibleVersion = compatibleProcessors[processorName]

	// Check if module is compatible
	if(compatibleVersion === undefined) {
		const error = new Error(`Processor ${processorName} is not supported yet.`)
		error.code = 'MODULE_NOT_SUPPORTED'
		throw error
	}

	return require(`./processors/${processorName}`)(_loadModule(processorName))
}

/**
 * Loads a processor
 *
 * @param {String} moduleName
 * @returns {*} processor
 */
function loadProcessor(moduleName) {
	return _loadProcessor(moduleName)
}

module.exports = loadProcessor
