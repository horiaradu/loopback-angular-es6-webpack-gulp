const webpack = require('webpack');
const pkg = require('./package.json');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');

require('dotenv').config({ silent: true });

const siteBaseUrl = process.env.SITE_BASE_URL || '/';

module.exports = {
  entry: [
    path.join(__dirname, 'client/src/app.js'),
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: `assets/${pkg.name}-${pkg.version}.js`,
    publicPath: siteBaseUrl,
  },
  resolve: {
    alias: {
      assets: path.join(__dirname, 'client/assets'),
      'server-shared': path.join(__dirname, 'server/shared'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'client/index.html'),
      version: pkg.version,
      siteBaseUrl,
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      R: 'ramda',
      moment: 'moment',
      'window.jQuery': 'jquery',
    }),
    new ExtractTextPlugin(`assets/${pkg.name}-${pkg.version}.css`),
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: /(node_modules|server)/, loader: 'ng-annotate!babel' },
      { test: /\.js$/, include: /server\/shared/, loader: 'babel' },
      { test: /\.html$/, loader: 'html' },
      {
        test: /\.(css|less)$/,
        loader: ExtractTextPlugin.extract('style?insertAt=top!', 'css!postcss!less'),
      },
      {
        test: /\.(jpe?g|png|gif|ttf|woff|woff2|svg|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file?name=assets/[name].[hash:6].[ext]',
      },
    ],
  },
  postcss() {
    return [autoprefixer];
  },
};
