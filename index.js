module.exports = function(mongoose) {
  var plugin = require('./plugin')(mongoose);

  return {
    plugin: plugin.configurator,
    oneToOne: function(model1, model1Association, model2, model2Association) {
      plugin.addModel(model1, 'oneToOne', model1Association, model2Association, model1Association + 'Id');
      plugin.addModel(model2, 'oneToOne', model2Association, model1Association, model2Association + 'Id');

      if (!model1 || !model2) return console.log('You must set schema1 and schema2 to hasOne function!');
      if (!model2Association || !model1Association) return console.log('You must set schema1 and schema2 foreign keys to hasOne function!');

      var add1 = {_include: String}, add2 = {_include: String};
      add1[model2Association] = {type: Object};
      add2[model1Association] = {type: Object};
      add1[model2Association + 'Id'] = {type: mongoose.Schema.Types.ObjectId, ref: model2.modelName};
      add2[model1Association + 'Id'] = {type: mongoose.Schema.Types.ObjectId, ref: model1.modelName};
      model1.schema.add(add1);
      model2.schema.add(add2);
    },
    oneToMany: function(model1, model1Association, model2, model2Association) {
      plugin.addModel(model1, 'oneToMany', model1Association, model2Association, model1Association + 'Id');
      plugin.addModel(model2, 'oneToMany', model2Association, model1Association, model2Association + 'Ids');

      if (!model1 || !model2) return console.log('You must set schema1 and schema2 to hasMany function!');
      if (!model2Association || !model1Association) return console.log('You must set schema1 and schema2 foreign keys to hasMany function!');

      var add1 = {_include: String}, add2 = {_include: String};
      add1[model2Association] = {type: Array};
      add2[model1Association] = {type: Object};
      add1[model2Association + 'Ids'] = {type: [mongoose.Schema.Types.ObjectId], ref: model2.modelName};
      add2[model1Association + 'Id'] = {type: mongoose.Schema.Types.ObjectId, ref: model1.modelName};
      model1.schema.add(add1);
      model2.schema.add(add2);
    }
  };
};