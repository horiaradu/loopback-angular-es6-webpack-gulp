const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

module.exports = (app) => {
  // enable authentication
  app.enableAuth();

  // to support JSON-encoded bodies
  app.use(bodyParser.json());
  // to support URL-encoded bodies
  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.use(cookieParser(app.get('cookieSecret')));

  // The access token is only available after boot
  app.use(app.loopback.token({
    model: app.models.accessToken,
  }));
};
