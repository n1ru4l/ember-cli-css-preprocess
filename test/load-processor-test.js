'use strict'

const processor = 'less'

const loadProcessor = require('./../load-processor')

describe('Module: loadProcessor', function() {

	before(function*() {
		this.timeout(0)
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

	it('can load a processor that is installed and supported', function*() {
		this.timeout(0)
		expect(loadProcessor(processor)).to.be.a('function')
	})
})
