module.exports = function(mongoose) {
  var stack = require('./utils/stack')();
  var utils = require('./utils/index')();

  return {
    addModel: function(model, relationType, association1, association2, anotherModelRef) {
      utils.addModel(model, relationType, association1, association2, anotherModelRef);
    },
    configurator: function(schema) {
      require('./middlewareConfigs/save')(stack, utils, schema);
      require('./middlewareConfigs/find')(stack, utils, schema);
      require('./middlewareConfigs/findOne')(stack, utils, schema);
      require('./middlewareConfigs/remove')(mongoose, stack, utils, schema);
    }
  }
};

