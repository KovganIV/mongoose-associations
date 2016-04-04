module.exports = function() {
  var stack = [];

  // Items example:

  return {
    put: function(_conditions) {
      stack.push(JSON.parse(JSON.stringify(_conditions)));

      if (_conditions._include) delete _conditions._include;
    },
    get: function(doc) {
      if (!doc) return null;
      doc = JSON.parse(JSON.stringify(doc));
      base: for (var i = stack.length - 1; i >= 0; i--) {
        for (var parName in stack[i]) {
          if (parName == '_include') continue;

          if (!(parName in stack[i])
            || !(stack[i][parName] == doc[parName]
            || (doc[parName] instanceof Array && stack[i][parName].length == doc[parName].length)
            || stack[i][parName] instanceof Object &&  doc[parName] instanceof Object)) {
            break base;
          }
        }
        return stack[i];
      }
      return null;
    }
  };
};