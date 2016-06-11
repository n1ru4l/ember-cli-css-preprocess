# ember-cli-css-preprocess  [![Build Status](https://travis-ci.org/n1ru4l/ember-cli-css-preprocess.svg?branch=develop "Build Status")](https://travis-ci.org/n1ru4l/ember-cli-css-preprocess)

Preprocess your stylesheets with multiple preprocessors.

Currently supported preprocessors:
- [postcss](https://github.com/postcss/postcss)
- [node-sass](https://www.npmjs.com/package/node-sass)
- [less](https://www.npmjs.com/package/less)

Please feel free to fork in order to add more processors!

You can determine in which order the stylesheets are processed!

## Installation

```shell
ember install ember-cli-css-preprocess
```

## Usage
### Basic configuration
All the configuration for this plugin is stored in the `ember-cli-build.js` in the root-directory of your ember application.

Search for the following lines:

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
    ...
```

And add the the basic options:

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [],
            extension:     'css'
        }
    ...
```

### Adding a preprocessor
Currently there a two available preprocessors which you can chain in any order (even multiple times if you want).

Supported processors:
- node-sass
- postcss
- less

To add on simply pass in an object to the `processors`-Array containing a `type`-Property with the processor title.
Furthermore you have to install the corresponding npm-module with the same name (e.g. `npm install autoprefixer --save-dev`).


#### Adding a Sass Preprocessor:

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [{
                type: 'node-sass',
				sourcemaps: true,  // enables sourcemaps
				options: {}
            }],
            extension: 'scss'
        }
    ...
```

By changing the `extension`-property you can specify the extension of your stylesheets. Because we are only processing our sheets with Sass we set the extension to `scss`.

Annotation: You can also pass all setting you could pass to [node-sass](https://github.com/sass/node-sass) by setting the `options`-object in the processor object. By default the only settings are the `includePath` which is set to your `styles`-folder and the sourcemap settings if `sourcemaps` is set to `true`. This allows you to include any stylesheet in your folder with the `@import`-rule

#### Adding a PostCSS Preprocessor:

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [{
                type: 'postcss',
                plugins: [{
                    module: require('autoprefixer'),
                    options: {
                        browsers: [
                            'last 2 versions'
                        ]
                    }
                }]
            }],
            extension: 'css'
        }
    ...
```

This is a basic postcss implementation using the [autoprefixer](https://github.com/postcss/autoprefixer) plugin.

The `plugin`-array is filled with objects with the `module` and the `options` properties. The latter obviously contains the options which are passed into the module/plugin when processing your stylesheets.

Annotation: Before requiring any postcss-plugin you have to install it via npm (e.g. `npm install autoprefixer --save`).

You can also add a custom parser or syntax by adding it to the processor object. Here is an example which uses the [postcss-scss](https://github.com/postcss/postcss-scss) `parser` (for adding a syntax, use the `syntax` property):

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [{
                type: 'postcss',
                parser: require('postcss-scss'),
                //syntax: require('postcss-scss'),
                plugins: [{
                    module: require('autoprefixer'),
                    options: {
                        browsers: [
                            'last 2 versions'
                        ]
                    }
                ]
            }],
            extension: 'css'
        }
    ...
```

#### Adding a less Preprocessor:

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [{
                type: 'less'
            }],
            extension: 'css'
        }
    ...
```

To include any less plugin you can make use of the `plugins`-array, it is handled like the postcss-plugin array.

#### Using multiple processors:

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [{
                type: 'node-sass'
            }, {
                type: 'postcss',
                plugins: [{
                    module: require('autoprefixer'),
                    options: {
                        browsers: [
                            'last 2 versions'
                        ]
                    }
                ]
            }
            ],
            extension: 'css'
        }
    ...
```

This example should clarify how to chain preprocessors. The position inside the `processors`-array determines the order in which the stylesheets are processed by each preprocessors (from top to bottom).

#### Using multiple input stylesheets

Multiple stylesheets are added by using the `outputPaths`-property (, which is not part of the `styleProcessorOptions`-property).

[Configuring Output Paths (Ember CLI Reference)](http://ember-cli.com/user-guide/#configuring-output-paths)

In addition to the default configuration you can add an extension to your `css`-value.

```javascript
... // styleProcessorOptions
			extension: 'scss' // specified extension, overrides default: css
		},
		outputPaths: {
	    	app: {
				css: {
					'app': 'assets/lel.css', // will parse app/styles/app.scss
					'amk.css': 'assets/toll.css', //will parse app/styles/amk.css
					'hippo.less': 'assets/eichhorn.css', //will parse app/styles/amk.less
					'trolol/bars': 'assets/foo.css' //will parse app/trolol/bars.scss
				}
			}
		}

```



#### Setup processor to parse specific files only (Filter):

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [{
                type: 'postcss',
                filter: ['test.css'],
                plugins: [{
                    module: require('autoprefixer'),
                    options: {
                        browsers: [
                            'last 2 versions'
                        ]
                    }
                ]
            }, {
                type: 'node-sass'
            }
            ],
            extension: 'css'
        }
    ...
```

With this setup the postcss processor will only process the file `test.css`. The `filter` property can either be a string or an array of strings.

An example for using the glob pattern:

```javascript
    var app = new EmberApp(defaults, {
        // Add options here
        styleProcessorOptions: {
            processors: [{
                type: 'node-sass',
                filter: ['*.scss']
            }, {
                type: 'less',
				filter: ['*.less']
            }
            ],
            extension: 'css'
        },
		outputPaths: {
	    	app: {
				css: {
					'app': 'assets/lel.css', // input file contents will equal input file contents
					'amk.css': 'assets/toll.css', // input file contents will equal input file contents
					'hippo.less': 'assets/eichhorn.css', // will only be processed by less processor
					'trolol.scss': 'assets/foo.css' // will only be processed by less processor
				}
			}
		},
		extension: 'css'
    ...
```

#### Resources

[Github: BroccoliCachingWriter](https://github.com/ember-cli/broccoli-caching-writer)
