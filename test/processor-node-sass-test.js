'use strict'

const npm = helper.npm
const stripIndent = helper.stripIndent
const processorLoader = require('./../processors/node-sass')

describe('Processor: node-sass', function() {

	before(function*() {
		this.timeout(0)
		yield npm.uninstall('node-sass')
		yield npm.install('node-sass@4.5.0')
	})

	after(function*() {
		this.timeout( 0 )
		yield npm.uninstall('node-sass')
	})

	it('can return a process-function', function*() {
		const sass = require('node-sass')
		const processor = processorLoader(sass)
		expect(processor).to.be.a('function')
	})

	it('can process data', function*() {
		const sass = require('node-sass')
		const processor = processorLoader(sass)

		const input = stripIndent`
			%bar {
				color: red;
			}

			%foo {
				color: yellow;
			}

			.foo {
				@extend %bar;
				@extend %foo;
				color: green;
			}

		`

		const expectedOutput = stripIndent`
			.foo {
			  color: red; }

			.foo {
			  color: yellow; }

			.foo {
			  color: green; }
			
			`

		const processorInfo = {}
		const fileInfo = {
			importPath: '.',
			inputFile: 'stdin'
		}

		const processedContent = yield processor(input, processorInfo, fileInfo)
		expect( processedContent ).to.be.equal(expectedOutput)
	})
})
