module.exports = {
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
  cookieSecret: process.env.COOKIE_SECRET || 'Your secret cookie goes here',
  remoting: {
    errorHandler: {
      handler: function (err, req, res, next) {
        console.log(err.stack);
        next();
      }
    }
  }
};
