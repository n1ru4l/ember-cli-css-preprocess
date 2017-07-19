'use strict'

const StyleProcessor = require('./../style-processor')

const options = {
	projectRoot: __dirname,
	processors: [],
	extension: 'css'
}

function getStyleProcessorConstructor(inputFile, outputFilename) {
	return {
		inputNodes: [],
		inputFile: typeof inputFile === 'string' ? `/test/app/styles/${inputFile}` : '/test/app/styles/foo.css',
		outputFile: typeof outputFilename === 'string' ? outputFilename : 'assets/foo.css',
		options: options
	}
}

function getStyleProcessorInstance(inputFile, outputFilename) {
	const opts = getStyleProcessorConstructor(inputFile, outputFilename)
	return new StyleProcessor(opts.inputNodes, opts.inputFile, opts.outputFile, opts.options)
}

describe('Class: StyleProcessor', function() {

	it('can be instantiated', function*() {

		const opts = getStyleProcessorConstructor()
		const styleProcessor = new StyleProcessor(opts.inputNodes, opts.inputFile, opts.outputFile, opts.options)

		expect(styleProcessor).to.be.instanceof(StyleProcessor)
	})

	describe('can check if a file should be processed by a style processor', function() {

		const styleProcessor = getStyleProcessorInstance('stylesheet.css')

		it('no filter', function*() {

			const result = styleProcessor._checkProcess()
			expect(result).to.be.true

		})

		it('string which equals filename', function*() {

			const result = styleProcessor._checkProcess('stylesheet.css')
			expect(result).to.be.true

		})

		it('string which not equals filename', function*() {

			const result = styleProcessor._checkProcess('foo.css')
			expect(result).to.be.false

		})

		it('glob string that matches filename', function*() {

			const result = styleProcessor._checkProcess('*.css')
			expect(result).to.be.true

		})

		it('glob string that does not match filename', function*() {

			const result = styleProcessor._checkProcess('*.scss')
			expect(result).to.be.false

		})

		it('array with string that matches filename', function*() {

			const result = styleProcessor._checkProcess(['stylesheet.css'])
			expect(result).to.be.true

		})

		it('array with glob string that does not match filename', function*() {

			const result = styleProcessor._checkProcess(['!stylesheet.css'])
			expect(result).to.be.false

		})

		it('array with additional negation', function*() {

			const result = styleProcessor._checkProcess(['stylesheet.css', '!*.css'])
			expect(result).to.be.false

		})

		it('array with additional affirmation', function*() {

			const result = styleProcessor._checkProcess(['!*.css', 'stylesheet.css'])
			expect(result).to.be.true

		})
	})
})
