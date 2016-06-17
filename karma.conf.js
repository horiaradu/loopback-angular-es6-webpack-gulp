var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.config.common');

module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'], //run in Chrome
    singleRun: true, //just run once by default
    frameworks: ['mocha', 'chai', 'es6-shim'], //use the mocha test framework
    files: [
      'spec.bundle.js' //just load this file
    ],
    plugins: [
      require('karma-chai'),
      require('karma-phantomjs-launcher'),
      require('karma-phantomjs-shim'),
      require('karma-mocha'),
      require('karma-mocha-reporter'),
      require('karma-sourcemap-loader'),
      require('karma-webpack'),
      require('karma-es6-shim'),
      require('karma-coverage'),
      require('karma-bamboo-reporter')
    ],
    preprocessors: {
      'spec.bundle.js': ['webpack', 'sourcemap'] //preprocess with webpack and our sourcemap loader
    },
    reporters: ['mocha', 'coverage', 'bamboo'], //report results in this format
    bambooReporter: {
      filename: 'coverage/unit.frontend.json' //optional, defaults to "mocha.json"
    },
    webpack: webpackMerge(commonConfig, { //kind of a copy of your webpack config
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      module: {
        preLoaders: [
          {test: /\.js$/, include: /(client\/src)/, exclude: /lb-services\.js/, loader: 'isparta'}
        ]
      },
      isparta: {
        embedSource: true,
        noAutoWrap: true,
        // these babel options will be passed only to isparta and not to babel-loader
        babel: {
          presets: ['es2015']
        }
      }
    }),
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    },
    coverageReporter: {
      type: 'html', //produces a html document after code is run
      dir: 'coverage/client/', //path to created html doc
      instrumenters: {
        isparta: require('isparta')
      },
      instrumenter: {
        '**/*.js': 'isparta'
      }
    },
    browserNoActivityTimeout: 100000
  });
};
