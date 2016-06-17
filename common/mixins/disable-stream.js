module.exports = function(Model) {
  Model.disableRemoteMethod('createChangeStream', true);
};

