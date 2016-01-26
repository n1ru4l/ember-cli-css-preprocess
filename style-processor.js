'use strict';

var CachingWriter       = require('broccoli-caching-writer'),
    merge               = require('lodash.merge'),
    deepMerge           = require('deepmerge'),
    mkdirp              = require('mkdirp'),
    path                = require('path'),
    fs                  = require('fs'),
    includePathSearcher = require('include-path-searcher'),

    //Preprocessors
    nodeSass            = require('node-sass'),
    postcss             = require('postcss'),
    less                = require('less');

StyleProcessor.prototype = Object.create(CachingWriter.prototype);
StyleProcessor.prototype.constructor = StyleProcessor;

function StyleProcessor(inputNodes, inputFile, outputFile, _options) {

    if (!(this instanceof StyleProcessor)) {
        return new StyleProcessor(sourceTrees, inputFile, outputFile, _options);
    }

    CachingWriter.call(this, inputNodes, {
        annotation: _options.annotation
    });

    this.options        = merge({}, _options);
    this.inputFile      = inputFile;
    this.outputFile     = outputFile;

    //Import path for preprocessors that allow including other files
    this.importPath = path.dirname(inputFile);
}

StyleProcessor.prototype.build = function() {
    var self = this;

    //Create destination file
    var destFile    = path.join(this.outputPath, this.outputFile);

    //Read input file
    var filename    = includePathSearcher.findFileSync(this.inputFile, this.inputPaths);
    var dataRaw     = fs.readFileSync(filename, 'utf8');

    //Execute processors in sequential order
    return this.options.processors.reduce(function(currentPromise, nextProcessor) {

        //Chain em all
        return currentPromise

        .then(function(dataProcessed) {
            return self.getProcessorPromise(dataProcessed, nextProcessor, filename);
        })

        //Catch Error from preprocessor and pass it one level higher!
        .catch(function(errBroccoli) {
            return Promise.reject(errBroccoli);
        });

    }, Promise.resolve(dataRaw))
    // Stylesheet preprocessing complete -> Write to file
    .then(function(dataProcessed) {
        mkdirp.sync(path.dirname(destFile));

        fs.writeFileSync(destFile, dataProcessed, {
            encoding: 'utf8'
        });

        //Resolve to tell broccoli we finished our async stuff
        return Promise.resolve();
    })
    // Stylesheet preprocessing failed -> Throw an error
    .catch(function(errBroccoli) {
        //Add missing data to error
        errBroccoli.file = this.inputFile;
        errBroccoli.treeDir = this.inputPaths[0];

        //Reject and tell broccoli we got some error
        return Promise.reject(errBroccoli);
    }.bind(this));
}

StyleProcessor.prototype.getProcessorPromise = function(dataToProcess, processor, currFilename) {

	//chech if the current processor is should process the current data
	var boolProcess = false;
	//TODO: why are the filenames fucked up?
	var needle = '/styles/';
	var needleIndex = currFilename.indexOf(needle);
	currFilename = currFilename.substr(needleIndex + needle.length);

	if(typeof processor.file === 'undefined') {
		boolProcess = true;
	} else if (processor.file === currFilename) {
		boolProcess = true;
	} else if (typeof processor.file === 'array') {
		if(processor.file.indexOf(currFilename) != -1) {
			boolProcess = true;
		}
	}

	if(!boolProcess) {
		return new Promise(function(res, rej) {
			return res(dataToProcess);
		});
	}

    if(processor.type === 'sass') {
        return this.compileSass(dataToProcess, processor);
    } else if (processor.type === 'postcss') {
        return this.compilePostCSS(dataToProcess, processor);
    } else if(processor.type === 'less') {
        return this.compileLess(dataToProcess, processor);
    } else {
        throw new Error('Unknown processor type');
    }
}

StyleProcessor.prototype.compileSass = function(data, processor) {
    return new Promise(function(res, rej) {

        var optionsDefault = {
            data: data,
            includePaths: ['.' + this.importPath]
        };

        var optionsConfig = processor.options || {};

        var options = deepMerge(optionsConfig, optionsDefault);

        nodeSass.render(options, function(errSass, result) {

            if(errSass) {
                //Transform sass error to broccoli error
                var errBroccoli     = new Error(errSass.message);
                errBroccoli.line    = errSass.line;
                errBroccoli.column  = errSass.column;

                return rej(errBroccoli)
            }

            return res(result.css);
        });
    }.bind(this))
}

StyleProcessor.prototype.compilePostCSS = function(data, processor) {

    if(!processor.plugins) {
        throw new Error('Please add plugins to your postcss-process!');
    }

	var processOptions = {};

    if(processor.parser) {
		processOptions.parser = processor.parser;
    }

	if(processor.syntax) {
		processOptions.syntax = processor.syntax;
    }

    //Wrap options in module
    var postcssPlugins = processor.plugins.reduce(function(pluginArray, curPluginConf) {

        if(typeof curPluginConf.module != 'function') {
            throw new Error('One of your postcss plugins is not a module!');
        }

        var pluginOptions = curPluginConf.options || {};
        pluginArray.push(curPluginConf.module(pluginOptions));

        return pluginArray;
    }, []);

    return new Promise(function(res, rej) {
        postcss(postcssPlugins)
        .process(data, processOptions)

        .then(function(dataProcessed) {
            return res(dataProcessed.css);
        })

        .catch(function(errPostCss) {
            //Transform postcss error to broccoli error
            var errBroccoli     = new Error(errPostCss.originalMessage);
            errBroccoli.line    = errPostCss.lineNumber;
            errBroccoli.column  = errPostCss.columnNumber;

            return rej(errBroccoli);
        });
    });
}

StyleProcessor.prototype.compileLess = function(data, processor) {

    var optionsConfig   = processor.options || {},
        optionsDefault  = { plugins: [], paths: [this.importPath] },
        options         = null;

    //Load plugins
    if(processor.plugins) {
        optionsDefault.plugins = processor.plugins.reduce(function(plugins, plugin) {
            var pluginOptions = plugin.options || null;
            plugins.push(new plugin.module(pluginOptions));
            return plugins;
        }, []);
    }

    options = merge({}, optionsDefault, optionsConfig);

    options = deepMerge(options, optionsDefault);

    return new Promise(function(res, rej) {
        less.render(data, options, function(errLess, result) {
            if(errLess) {

                //Concat error message
                var errMessage      = errLess.message + "\n" + errLess.extract[0];

                //Transform postcss error to broccoli error
                var errBroccoli     = new Error(errMessage);
                errBroccoli.line    = errLess.line;
                errBroccoli.column  = errLess.column;

                return rej(errBroccoli);
            }

            return res(result.css);
        })
    }.bind(this));
}

module.exports = StyleProcessor;
