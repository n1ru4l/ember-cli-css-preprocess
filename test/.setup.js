'use strict'

const Mocha = require('mocha')
const coMocha = require('co-mocha')
const chai = require('chai')

const spawn = require('child_process').spawn

const commonTags = require('common-tags')
const TemplateTag = commonTags.TemplateTag
const stripIndentTransformer = commonTags.stripIndentTransformer
const trimResultTransformer = commonTags.trimResultTransformer
const replaceResultTransformer = commonTags.replaceResultTransformer

const stripIndent = new TemplateTag(
  stripIndentTransformer,
  replaceResultTransformer(/\n(\n*)\s*?$/, '$1'),
  replaceResultTransformer(/^\n/, '')
)

function _run_cmd(cmd, args) {
	return new Promise((res, rej) => {
		const child = spawn(cmd, args)
		let resp = ''
		child.stdout.on('data', function (buffer) {
			resp += buffer.toString()
		})
		child.stdout.on('end', function() {
			res(resp)
		})
		child.stdout.on('error', (err) => rej(err))
	})
}

coMocha(Mocha)
global.mocha = Mocha
global.expect = chai.expect

global.helper = {
	npm: {
		install: function (module) {
			return _run_cmd('npm', ['install', module])
		},
		uninstall: function (module) {
			return _run_cmd('npm', ['uninstall', module])
		}
	},
	stripIndent: stripIndent
}
