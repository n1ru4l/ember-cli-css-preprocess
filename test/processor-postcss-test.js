'use strict'

const npm = helper.npm
const stripIndent = helper.stripIndent
const processorLoader = require('./../processors/postcss')

describe('Processor: postcss', function() {

	before(function*() {
		this.timeout(0)
		yield npm.install('postcss@5.0.14')
		yield npm.install('autoprefixer')
	})

	after(function*() {
		this.timeout( 0 )
		yield npm.uninstall('postcss')
		yield npm.uninstall('autoprefixer')

	})

	it('can return a process-function', function*() {
		const postCSS = require('postcss')
		const processor = processorLoader(postCSS)
		expect(processor).to.be.a.function
	})

	it('can process data', function*() {

		const postcss = require('postcss')
		const processor = processorLoader(postcss)

		const input = stripIndent`
		::placeholder {
			color: red;
		}
		`

		const expectedOutput = stripIndent`
		::-webkit-input-placeholder {
			color: red;
		}
		::placeholder {
			color: red;
		}
		`

		const processorInfo = {
			type: 'postcss',
			plugins: [{
				module: require('autoprefixer'),
				options: {
					browsers: [
						'chrome 51'
					]
				}
			}]
		}

		const fileInfo = {
			importPath: '.',
			inputFile: 'stdin'
		}

		const processedContent = yield processor(input, processorInfo, fileInfo)
		expect( processedContent ).to.be.equal(expectedOutput)
	})
})
