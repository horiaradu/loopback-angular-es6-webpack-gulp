// Add validations for base type model
module.exports = function(Model) {
  Model.validatesPresenceOf('name');
  Model.validatesLengthOf('name', {min: 1, max: 20});
  Model.validatesUniquenessOf('name');
};
