module.exports = function(stack, utils, schema) {
  var Q = require('q');

  schema.pre('findOne', function(next) {
    stack.put(this._conditions);
    next()
  });

  schema.post('findOne', function(doc, next) {
    if (!doc) return next();

    var promises = [];
    var request = stack.get(doc);
    // _include
    if ('_include' in request) {
      var model = utils.getModel(request._include);
      if (model) {
        promises.push(model
          .findById(doc[request._include + 'Id'])
          .then(function(result) {
            if (!result) return;

            doc.set(request._include, result, {strict: false});
            return;
          }));
      }
    }

    if (promises.length == 0) return next();

    Q.all(promises)
      .then(function() {
        next();
      });
  });
};