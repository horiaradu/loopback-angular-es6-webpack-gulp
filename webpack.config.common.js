var webpack = require('webpack');
var pkg = require('./package.json');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');

module.exports = {
  entry: [
    path.join(__dirname, 'client/src/app.js')
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'assets/bundle-' + pkg.version + '.js',
    publicPath: '/'
  },
  resolve: {
    alias: {
      assets: path.join(__dirname, 'client/assets'),
      server_shared: path.join(__dirname, 'server/shared')
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'client/index.html')
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      R: 'ramda',
      'window.d3': 'd3',
      'window.jQuery': 'jquery'
    }),
    new ExtractTextPlugin('assets/bundle-' + pkg.version + '.css')
  ],
  module: {
    loaders: [
      {test: /\.js$/, exclude: /(node_modules|server)/, loader: 'ng-annotate!babel'},
      {test: /\.js$/, include: /server\/shared/, loader: 'babel'},
      {test: /\.html$/, loader: 'html'},
      {
        test: /\.(css|less)$/,
        loader: ExtractTextPlugin.extract('style?insertAt=top!', 'css!postcss!less')
      },
      {
        test: /\.(jpe?g|png|gif|ttf|woff|woff2|svg|eot)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file?name=assets/[name].[hash:6].[ext]'
      }
    ]
  },
  postcss: function () {
    return [autoprefixer];
  }
};
