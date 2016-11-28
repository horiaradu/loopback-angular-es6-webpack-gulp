"use strict";

module.exports = function (app) {
  const router = app.loopback.Router();

  router.get('/env-settings', (req, res) => {
    res.json(app.get('envSettings'));
  });

  app.use(router);
};
