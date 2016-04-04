module.exports = function(stack, utils, schema) {
  var Q = require('q');

  // OneToOne
  function completeOneToOne(context, model, keyValue) {
    if (context.get(model.association1) && context.get(model.association1)._id) {
      return model
        .findById(context.get(model.association1)._id)
        .then(function(result) {
          if (!result) return null; // Not found error

          result.set(model.association2 + 'Id', context._id, { strict: false });
          result.save();
          context.set(model.association1 + 'Id', context.get(model.association1)._id);
          return null;
        });
    } else if (context.get(model.association1)) {
      var item = new model(context.get(model.association1));
      return item
        .save()
        .then(function() {
          context.set(model.association1 + 'Id', item._id);
          return null;
        });
    } else if (context.get(keyValue.path)) {
      return model
        .findById(context.get(keyValue.path))
        .then(function(result) {
          if (!result) return null; // Not found error

          result.set(model.association2 + 'Id', context._id, { strict: false });
          result.save();
          return null;
        });
    } else return null;
  }

  // OneToMany
  function completeOneToMany(doc, model, keyValue) {
    if (keyValue.instance == 'Array' && doc.get(keyValue.path) && doc.get(keyValue.path).length > 0) {
      var setConfig = {};
      setConfig[model.association2 + 'Id'] = doc._id;
      return model
        .update({_id: {$in: doc.get(keyValue.path)}}, {$set: setConfig}, {multi: true});
    } else if (keyValue.instance == 'ObjectID') {
      var pushConfig = {};
      pushConfig[model.association2 + 'Ids'] = doc._id;
      return model
        .update({_id: doc.get(keyValue.path)}, {$push: pushConfig});
    } else return null;
  }

  schema.pre('save', function(next) {
    var context = this;
    var promises = [];

    var model;
    for (var fieldName in this.toJSON()) {
      var keyValue = utils.getAssocValueByRef(schema.paths, fieldName);
      // || !(keyValue.instance == 'Array' || keyValue.instance == 'ObjectID')
      if (!keyValue) {
        keyValue = utils.getAssocValueById(schema.paths, fieldName);
        if (!keyValue) continue;
        else model = utils.getModel(keyValue.options.ref);
      } else model = utils.getModel(fieldName);

      if (!model) continue;

      if (model.relationType == 'oneToOne') {
        promises.push(completeOneToOne(context, model, keyValue));
      } else if (model.relationType == 'oneToMany') {
        context.set(keyValue.options.ref);
      }
    }

    if (promises.length == 0) return next();

    Q.all(promises)
      .then(function() {
        if (model) context.set(model.association1);
        next();
      });
  });

  schema.post('save', function(doc, next) {
    var promises = [];

    var model;
    for (var fieldName in doc.toJSON()) {
      var keyValue = utils.getAssocValueById(schema.paths, fieldName);

      if (!keyValue) continue;
      else model = utils.getModel(keyValue.options.ref);

      if (!model) continue;

      if (model.relationType == 'oneToMany') {
        promises.push(completeOneToMany(doc, model, keyValue));
      }
    }

    if (promises.length == 0) return next();

    Q.all(promises)
      .then(function() {
        next();
      });
  });
};