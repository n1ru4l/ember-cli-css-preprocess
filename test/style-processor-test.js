'use strict'

const StyleProcessor = require('./../style-processor')

const options = {
	projectRoot: __dirname,
	processors: [],
	extension: 'css'
}

function getStyleProcessorConstructor(inputFile) {
	return {
		inputNodes: [],
		inputFile: typeof inputFile === 'string' ? inputFile : '/test/app/styles/foo.css',
		outputFile: 'test/dist/assets/bar.css',
		options: options
	}
}

function getStyleProcessorInstance(inputFile) {
	const opts = getStyleProcessorConstructor(inputFile)
	return new StyleProcessor(opts.inputNodes, opts.inputFile, opts.outputFile, opts.options)
}

describe('Class: StyleProcessor', function() {

	it('can be instantiated', function*() {

		const opts = getStyleProcessorConstructor()
		const styleProcessor = new StyleProcessor(opts.inputNodes, opts.inputFile, opts.outputFile, opts.options)

		expect(styleProcessor).to.be.instanceof(StyleProcessor)
	})

	describe('check files to process', function() {

		// inputPath should always be 'absolute' to project root
		const styleProcessor = getStyleProcessorInstance('/test/app/styles/stylesheet.css')

		it('can filter filename', function*() {

			const result = styleProcessor._checkProcess('stylesheet.css')
			expect(result).to.be.true

		})

		it('can not filter filename', function*() {

			const result = styleProcessor._checkProcess('foo.css')
			expect(result).to.be.false

		})

		it('can filter glob', function*() {

			const result = styleProcessor._checkProcess('*.css')
			expect(result).to.be.true

		})

		it('can not filter glob', function*() {

			const result = styleProcessor._checkProcess('*.scss')
			expect(result).to.be.false

		})
	})
})
