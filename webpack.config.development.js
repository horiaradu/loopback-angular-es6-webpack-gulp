var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.config.common.js');

var config = {
  devtool: 'source-map',
  module: {
    preLoaders: [
      {test: /\.js$/, exclude: /(node_modules|lb-services)/, loader: 'eslint'}
    ]
  }
};

if (parseInt(process.env.HMR_ENABLED)) {
  config.entry = [
    'webpack-hot-middleware/client'
  ];
}

module.exports = webpackMerge(commonConfig, config);
