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
        return currentPromise.then(function(dataProcessed) {
            return self.getProcessorPromise(dataProcessed, nextProcessor);
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

    .catch(function(err) {
        console.log(err);
    });
}

StyleProcessor.prototype.getProcessorPromise = function(dataToProcess, processor) {
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
            includePaths: [this.importPath]
        };

        var optionsConfig = processor.options || {};

        var options = deepMerge(optionsConfig, optionsDefault);
        
        var compiledCSS = nodeSass.renderSync(optionsDefault).css;

        return res(compiledCSS);
    }.bind(this))
}

StyleProcessor.prototype.compilePostCSS = function(data, processor) {

    if(!processor.plugins) {
        throw new Error('Please add plugins to your postcss-process!');
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
        .process(data)
        .then(function(dataProcessed) {
            return res(dataProcessed.css);
        });
    });
}

StyleProcessor.prototype.compileLess = function(data, processor) {

    var optionsConfig   = processor.options || {},
        optionsDefault   = { plugins: [], paths: [this.importPath] },
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
        less.render(data, options, function(e, output) {
            if(e) {
                return rej(e);
            }

            return res(output.css);
        })
    }.bind(this));
}

module.exports = StyleProcessor;
