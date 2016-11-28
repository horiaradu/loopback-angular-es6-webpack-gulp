const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.config.common');
const karmaChai = require('karma-chai');
const phantomJSLauncher = require('karma-phantomjs-launcher');
const phantomJSShim = require('karma-phantomjs-shim');
const karmaMocha = require('karma-mocha');
const reporter = require('karma-mocha-reporter');
const sourceMapLoader = require('karma-sourcemap-loader');
const karmaWebpack = require('karma-webpack');
const es6Shim = require('karma-es6-shim');
const karmaCoverage = require('karma-coverage');
const junitReporter = require('karma-junit-reporter');
const karmaSinonChai = require('karma-sinon-chai');
const isparta = require('isparta');

module.exports = function configure(config) {
  config.set({
    browsers: ['PhantomJS'], // run in Chrome
    singleRun: true, // just run once by default
    frameworks: ['mocha', 'sinon-chai', 'es6-shim'], // use the mocha test framework
    files: [
      'spec.bundle.js', // just load this file
    ],
    plugins: [
      karmaChai,
      phantomJSLauncher,
      phantomJSShim,
      karmaMocha,
      reporter,
      sourceMapLoader,
      karmaWebpack,
      es6Shim,
      karmaCoverage,
      junitReporter,
      karmaSinonChai,
    ],
    preprocessors: {
      'spec.bundle.js': ['webpack', 'sourcemap'], // preprocess with webpack and our sourcemap loader
    },
    reporters: ['mocha', 'coverage', 'junit'], // report results in this format
    junitReporter: {
      outputDir: 'coverage',
      useBrowserName: false,
      outputFile: 'junit.frontend.xml', // optional, defaults to "mocha.json"
    },
    webpack: webpackMerge(commonConfig, { // kind of a copy of your webpack config
      devtool: 'inline-source-map', // just do inline source maps instead of the default
      module: {
        preLoaders: [
          { test: /\.js$/, include: /(client\/src)/, exclude: /lb-services\.js/, loader: 'isparta' },
        ],
      },
      isparta: {
        embedSource: true,
        noAutoWrap: true,
        // these babel options will be passed only to isparta and not to babel-loader
        babel: {
          presets: ['es2015'],
        },
      },
    }),
    webpackServer: {
      noInfo: true, // please don't spam the console when running in karma!
    },
    coverageReporter: {
      type: 'html', // produces a html document after code is run
      dir: 'coverage/client/', // path to created html doc
      instrumenters: {
        isparta,
      },
      instrumenter: {
        '**/*.js': 'isparta',
      },
      reporters: [
        // reporters not supporting the `file` property
        { type: 'cobertura', subdir: '../', file: 'cobertura.frontend.xml' },
        { type: 'html', subdir: './client' },
      ],
    },
    captureTimeout: 100000,
    retryLimit: 4,
    browserDisconnectTimeout: 2000,
    browserDisconnectTolerance: 6,
    browserNoActivityTimeout: 50000,
  });
};
