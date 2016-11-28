const path = require('path');
const webpack = require('webpack');
/* eslint-disable import/no-dynamic-require */
const webpackConfig = require(path.resolve(__dirname, '../../', 'webpack.config.development'));

module.exports = (app) => {
  if (!parseInt(process.env.HMR_ENABLED)) {
    return;
  }

  /* eslint-disable import/no-extraneous-dependencies */
  /* eslint-disable global-require */
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const compiler = webpack(webpackConfig);

  app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath,
  }));

  app.use(webpackHotMiddleware(compiler));
};
