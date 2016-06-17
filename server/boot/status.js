module.exports = function(app) {
  // Install a `/` route that returns server status
  var router = app.loopback.Router();
  router.get('/status', app.loopback.status());
  app.use(router);
};
