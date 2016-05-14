'use strict'

const gulp = require('gulp')
const eslint = require('gulp-eslint')
const mocha = require('gulp-mocha')

gulp.task('lint', function() {
	return gulp.src(['**/*.js', '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError())
})

gulp.task('mocha', function() {
	return gulp.src(['test/**/*.js', '!test/.setup.js', '!test/test-app'])
		.pipe(mocha({
			require: [
				'./test/.setup.js'
			]
		}))
		.once('error', function() {
			process.exit(1)
		})
})

gulp.task('test', ['lint', 'mocha'])
