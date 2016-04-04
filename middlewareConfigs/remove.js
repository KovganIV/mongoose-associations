module.exports = function(mongoose, stack, utils, schema) {
  var Q = require('q');

  schema.pre('remove', function(next) {
    console.log('*');
    var context = this;

    var model = context.model(context.constructor.modelName);
    if (!model) return next();
    //console.log(context);
    return model
      .find({_id: context._id})
      .then(function(docs) {
        var promises = [];
        for (var i = 0; i < docs.length; i++) {
          var doc = docs[i];
          for (var fieldName in doc.toJSON()) {
            var keyValue = utils.getAssocValueById(schema.paths, fieldName);
            if (!keyValue) continue;
            var relatedModel = context.model(keyValue.options.ref);
            if (!relatedModel) continue;

            if (relatedModel.relationType == 'oneToOne') {
              var modelDoc = new relatedModel({_id: doc.toJSON()[fieldName]});
              modelDoc.set(model.anotherModelRef);
              promises.push(modelDoc.save());
            } else if (relatedModel.relationType == 'oneToMany') {
              if (model.anotherModelRef.indexOf('Ids') != -1) {
                var pull = {};
                pull[model.anotherModelRef] = context._id;
                promises.push(relatedModel.update({_id: doc.toJSON()[fieldName]}, {$pull: pull}));
              } else if (model.anotherModelRef.indexOf('Id') != -1) {
                var config = {$unset: {}};
                config.$unset[model.anotherModelRef] = '';
                promises.push(relatedModel.update({_id: {$in: doc.toJSON()[fieldName]}}, config, {multi: true}));
              }
            }
          }
        }

        if (promises.length == 0) return next();

        return Q.all(promises)
          .then(function(result) {
            //console.log(result);
            next();
          });
      })
      .catch(function(err) {
        console.log(err.stack);
      });
  });

  schema.post('remove', function(query) {

  });
};
