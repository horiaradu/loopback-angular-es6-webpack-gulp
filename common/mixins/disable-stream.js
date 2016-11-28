module.exports = (Model) => {
  Model.disableRemoteMethod('createChangeStream', true);
};

