'use strict'

const Mocha = require('mocha')
const coMocha = require('co-mocha')
const chai = require('chai')

const rimraf = require('rimraf-promise')
const spawn = require('child_process').spawn

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

function npmUninstall(module) {
	return rimraf(`./node_modules/${module}`)
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
			return rimraf(`node_modules/${module}`)
		}
	}
}
