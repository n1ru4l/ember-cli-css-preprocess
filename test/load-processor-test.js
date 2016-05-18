'use strict'

const processor = 'less'
const incompatibleVersion = '1.6.3'
const compatibleVersion = '2.5.3'
const npm = helper.npm

describe('Module: _loadProcessor', function() {
	const loadProcessor = require('./../_load-processor')

	before(function * () {
		this.timeout(0)
		yield npm.uninstall(processor)
	})

	after(function * () {
		this.timeout(0)
		yield npm.uninstall(processor)
	})

	it('can not load a processor that is not supported', function * () {
		try {
			loadProcessor('this-Module-will-never-exists-187')
		} catch(err) {
			expect(err.code).to.be.equal('MODULE_NOT_SUPPORTED')
		}
	})

	it('can not load a processor that is supported but not installed', function * () {
		try {
			loadProcessor(processor)
		} catch(err) {
			expect(err.code).to.be.equal('MODULE_NOT_INSTALLED')
		}
	})

	it('can not load a processor that is supported but has an non matching version', function * () {
		this.timeout(0)
		yield npm.install(`${processor}@${incompatibleVersion}`)
		try {
			loadProcessor(processor)
			throw new Error('Module got loaded...')
		} catch(err) {
			expect(err.code).to.be.equal('MODULE_NOT_COMPATIBLE')
		}
	})

	it('can load a processor that is installed and supported', function * () {
		this.timeout(0)
		yield npm.uninstall(processor)
		yield npm.install(`${processor}@${compatibleVersion}`)

		const _processor = loadProcessor(processor)
		expect(_processor).to.be.a.function
	})
})
