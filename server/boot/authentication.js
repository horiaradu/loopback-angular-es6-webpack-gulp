module.exports = function enableAuthentication(app) {

  var bodyParser = require('body-parser');

  // enable authentication
  app.enableAuth();

  // to support JSON-encoded bodies
  app.use(bodyParser.json());
  // to support URL-encoded bodies
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  // The access token is only available after boot
  app.use(app.loopback.token({
    model: app.models.accessToken
  }));
};
