# ember-cli-css-preprocess ![Build status](https://travis-ci.org/n1ru4l/ember-cli-css-preprocess.svg?branch=develop "Build Status")
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
                type: 'node-sass'
            }],
            extension: 'scss'
        }
    ...
```

By changing the `extension`-property you can specify the extension of your stylesheets. Because we are only processing our sheets with Sass we set the extension to `scss`.

Annotation: You can also pass all setting you could pass to [node-sass](https://github.com/sass/node-sass) by setting the `options`-object in the processor object. By default the only setting is the `includePath` which is set to your `styles`-folder. This allows you to include any stylesheet in your folder with the `@import`-rule

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
                ]
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
The filter supports the glob pattern.
