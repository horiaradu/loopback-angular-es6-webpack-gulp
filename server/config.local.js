const path = require('path');
const pkg = require('../package.json');

module.exports = {
  version: pkg.version,
  appName: pkg.name,
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
  cookieSecret: process.env.COOKIE_SECRET || 'Your secret cookie goes here',
  remoting: {
    errorHandler: {
      handler(err, req, res, next) {
        console.log(err.stack);
        next();
      },
    },
  },
  clientSrc: path.resolve(__dirname, '../client'),
  clientBuild: path.resolve(__dirname, '../build'),
  envSettings: {
    FOO: 'bar',
  },
};
