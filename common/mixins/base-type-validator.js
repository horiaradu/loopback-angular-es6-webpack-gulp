// Add validations for base type model
module.exports = (Model) => {
  Model.validatesPresenceOf('name');
  Model.validatesLengthOf('name', { min: 1, max: 20 });
  Model.validatesUniquenessOf('name');
};
