'use strict'

const compatibleProcessors = require( './package' ).compatibleProcessors
const semver = require( 'semver' )
const finder = require( 'find-package-json' )
  // const resolve = require('resolve')

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

const _loadModule = function( moduleName ) {
	let modulePath
	// Check if module exists
	try {
		modulePath = require.resolve( moduleName )
	} catch ( err ) {
		switch ( err.code ) {
		case 'MODULE_NOT_FOUND':
			const error = new Error( `Processor ${moduleName} not found. Please install it first (npm install ${moduleName} --save)` )
			error.code = 'MODULE_NOT_INSTALLED'
			throw error
		default:
			throw err
		}
	}

  //Check if module version is supported
	const f = finder( modulePath )
	const moduleVersion = f.next().value.version
	const compatibleVersion = compatibleProcessors[ moduleName ]

	if ( !semver.satisfies( moduleVersion, compatibleVersion ) ) {
		const error = new Error( `Processor ${moduleName} (${moduleVersion}) is not compatible. Required version: ${compatibleVersion}` )
		error.code = 'MODULE_NOT_COMPATIBLE'
		throw error
	}

	return require( moduleName )
}

/**
 * Loads a processor
 *
 * @private
 * @param {String} processorName
 * @returns {Function} processor
 */
const _loadProcessor = function( processorName ) {
	const compatibleVersion = compatibleProcessors[ processorName ]

	// Check if module is compatible
	if ( compatibleVersion === undefined ) {
		const error = new Error( `Processor ${processorName} is not supported yet.` )
		error.code = 'MODULE_NOT_SUPPORTED'
		throw error
	}

	const _module = _loadModule( processorName )
	const processor = require( `./processors/${processorName}` )

	return processor( _module )
}

/**
 * Loads a processor
 *
 * @param {String} moduleName
 * @returns {*} processor
 */
function loadProcessor( moduleName ) {
	let _module = _processors[ moduleName ]
	if ( _module !== undefined ) {
		return _module
	}
	_module = _loadProcessor( moduleName )
	_processors[ moduleName ] = _module
	return _module
}

module.exports = loadProcessor
