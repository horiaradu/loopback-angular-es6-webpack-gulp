module.exports = (app) => {
  const router = app.loopback.Router();
  router.get('/version', (req, res) => {
    res.send(app.get('version'));
  });
  app.use(router);
};
