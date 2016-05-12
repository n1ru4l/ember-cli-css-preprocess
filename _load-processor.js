'use strict'

const fs = require('fs')
const co = require('co')
const compatibleProcessors = require('./package').compatibleProcessors;
const semver = require('semver')
const finder = require('find-package-json')

/**
 * A module for loading a style processor
 * @module loadProcessor
 */

const _processors = {}

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
const _loadModule = function(moduleName) {
    let modulePath;
	// Check if module exists
    try {
        modulePath = require.resolve(moduleName)
    } catch (err) {
        switch (err.code) {
            case 'MODULE_NOT_FOUND':
                throw new Error(`Processor ${moduleName} not found. Please install it first`)
            default:
                throw err
        }
    }

    //Check if module version is supported
    const f = finder(modulePath)
    const moduleVersion = f.next().value.version
	const compatibleVersion = compatibleProcessors[moduleName]

    if (!semver.satisfies(moduleVersion, compatibleVersion)) {
        throw new Error(`Processor ${moduleName} (${moduleVersion}) is not compatible. Required version: ${compatibleVersion}`)
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
const _loadProcessor = function (processorName) {
	const compatibleVersion = compatibleProcessors[processorName]

    // Check if module is compatible
    if (compatibleVersion === undefined) {
        throw new Error(`Processor ${processorName} is not supported yet.`)
    }

	const module = _loadModule(processorName)
	const processor = require(`./processors/${processorName}`)

	return processor(module)
}

/**
 * Loads a processor
 *
 * @param {String} moduleName
 * @returns {*} processor
 */
function loadProcessor(moduleName) {
	let module = _processors[moduleName]
	if(module !== undefined) {
		return module
	}

	module = _loadProcessor(moduleName)
	_processors[moduleName] = module
	return module
}

module.exports = loadProcessor
