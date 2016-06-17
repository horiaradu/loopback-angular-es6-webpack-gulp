module.exports = function(Model) {

  var FILTERED_PROPERTIES = ['id'];

  Model.observe('before save', function (ctx, next) {
    if (ctx.instance) {
      FILTERED_PROPERTIES.forEach(function(p) { ctx.instance.unsetAttribute(p); });
    } else {
      FILTERED_PROPERTIES.forEach(function(p) { delete ctx.data[p]; });
    }
    next();
  });
};
