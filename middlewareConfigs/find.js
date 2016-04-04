module.exports = function(stack, utils, schema) {
  var Q = require('q');

  schema.pre('find', function(next) {
    stack.put(this._conditions);
    next()
  });

  schema.post('find', function(docs, next) {
    if (!docs[0]) return next();

    var promises = [];
    var request = stack.get(docs[0]);
    // _include
    if (request && '_include' in request) {
      var model = utils.getModel(request._include);
      if (model) {
        for (var i = 0; i < docs.length; i++) {
          if (docs[i].get(request._include + 'Id')) {
            promises.push(model
              .findById(docs[i].get(request._include + 'Id'))
              .then(function(result) {
                if (!result) return;

                for (var i = 0; i < docs.length; i++) {
                  if (toString(docs[i].get(request._include + 'Id')) == toString(result._id)) {
                    docs[i].set(request._include, result, {strict: false});
                    result.set(model.association2);
                    docs[i].set(request._include + 'Id');
                  }
                }
                return;
              }));
          } else if (docs[i].get(request._include + 'Ids')
            && docs[i].get(request._include + 'Ids').length > 0) {
            promises.push(model
              .find({_id: {$in: docs[i].get(request._include + 'Ids')}})
              .then(function(result) {
                if (!result || (result && result.length == 0)) return;

                for (var i = 0; i < docs.length; i++) {
                  var array = [];
                  for (var k = 0; k < result.length; k++) {
                    if (docs[i].get(request._include + 'Ids').indexOf(result[k]._id) != -1) {
                      array.push(result[k]);
                    }
                  }
                  if (array.length == 0) continue;
                  docs[i].set(request._include, array, {strict: false});
                  docs[i].set(request._include + 'Ids');
                }
                return;
              }));
          }
        }
      }
    }

    if (promises.length == 0) return next();

    Q.all(promises)
      .then(function() {
        next();
      })
      .catch(function(err) {
        console.log(err);
      });
  });
};
