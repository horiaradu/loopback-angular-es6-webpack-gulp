module.exports = (app) => {
  const router = app.loopback.Router();
  router.get('/status', app.loopback.status());
  app.use(router);
};
