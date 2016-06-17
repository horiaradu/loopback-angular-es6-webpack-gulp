var webpack = require('webpack');
var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.config.common.js');

module.exports = webpackMerge(commonConfig, {
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
});
