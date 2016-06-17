module.exports = function (app) {
  // Install a `/` route that returns server status
  var router = app.loopback.Router();
  router.get('/version', function (req, res) {
    res.send(app.version);
  });
  app.use(router);
};
