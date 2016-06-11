'use strict'

const processor = 'less'
const incompatibleVersion = '1.6.3'
const compatibleVersion = '2.7.1'
const npm = helper.npm

const loadProcessor = require('./../load-processor')

describe('Module: loadProcessor', function() {

	before(function*() {

		this.timeout(0)
		yield npm.uninstall(processor)
	})

	after(function*() {

		this.timeout(0)
	})

	it('can not load a processor that is not supported', function*() {

		try {
			loadProcessor('this-Module-will-never-exists-187')
		} catch(err) {
			expect(err.code).to.be.equal('MODULE_NOT_SUPPORTED')
		}
	})

	it('can not load a processor that is supported but not installed', function*() {

		try {
			loadProcessor(processor)
		} catch(err) {
			expect(err.code).to.be.equal('MODULE_NOT_INSTALLED')
		}
	})


	it('can load a processor that is installed and supported', function*() {

		this.timeout(0)
		yield npm.install(`${processor}@${compatibleVersion}`)

		expect(loadProcessor(processor)).to.be.a.function
		yield npm.uninstall(processor)
	})

	it('can not load a processor that is supported but has an non matching version', function*() {

		this.timeout(0)
		yield npm.install(`${processor}@${incompatibleVersion}`)

		try {

			loadProcessor(processor)
			throw new Error('Module got loaded...')

		} catch(err) {
			expect(err.code).to.be.equal('MODULE_NOT_COMPATIBLE')
		}

		yield npm.uninstall(processor)
	})
})
