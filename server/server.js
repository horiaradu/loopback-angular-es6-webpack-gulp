require('babel-register');
require('dotenv').config({silent: true});
const loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');

var app = module.exports = loopback();

var version = require(path.resolve(__dirname, '../package.json')).version;
app.version = version;

app.use(loopback.static(path.resolve(__dirname, '../build')));

app.start = function () {
  // start the web server
  return app.listen(function () {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

boot(app, __dirname, function (err) {
  if (err) {
    throw err;
  }

  // start the server if `$ node server.js`
  if (require.main === module || require.main.filename.indexOf('server.js') !== -1) {
    app.start();
  }
});
