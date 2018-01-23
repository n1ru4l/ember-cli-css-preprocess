'use strict'

const stripIndent = helper.stripIndent
const processorLoader = require('./../processors/less')

describe('Processor: less', function() {

	it('can return a process-function', function*() {
		const less = require('less')
		const processor = processorLoader(less)
		expect(processor).to.be.a('function')
	})

	it('can process data', function*() {

		const processor = processorLoader(require('less'))

		const input = stripIndent`
		.class { width: (1 + 1) }
		`

		const expectedOutput = stripIndent`
		.class {
		  width: 2;
		}

		`

		const processorInfo = {
			type: 'less'
		}

		const fileInfo = {
			importPath: '.',
			inputFile: 'stdin'
		}

		const processedContent = yield processor(input, processorInfo, fileInfo)
		expect(processedContent).to.be.equal(expectedOutput)
	})
})
