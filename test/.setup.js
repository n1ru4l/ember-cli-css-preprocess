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
		trimResultTransformer('left'),
		replaceResultTransformer(/\n(\n*)\s*?$/, '$1')
)

coMocha(Mocha)
global.mocha = Mocha
global.expect = chai.expect

global.helper = {
	stripIndent: stripIndent
}
