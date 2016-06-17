module.exports = function (app) {
  if (!parseInt(process.env.HMR_ENABLED)) {
    return;
  }

  var path = require('path');
  var webpack = require('webpack');
  var webpackConfig = require(path.resolve(__dirname, '../../', 'webpack.config.development'));
  var compiler = webpack(webpackConfig);

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath
  }));

  app.use(require('webpack-hot-middleware')(compiler));
};
