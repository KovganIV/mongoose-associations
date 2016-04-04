module.exports = function() {
  var models = [];

  return {
    addModel: function(model, relationType, association1, association2, anotherModelRef) {
      model.association1 = association1;
      model.association2 = association2;
      model.relationType = relationType;
      model.anotherModelRef = anotherModelRef;
      if (models.indexOf(model) == -1) models.push(model);
    },
    getModel: function(association1) {
      for (var i = 0; i < models.length; i++) {
        if (models[i].association1 == association1) return models[i];
      }
      return null;
    },
    getAssocValueByRef: function(fields, ref) {
      for (var i in fields) {
        if (fields[i].options.ref == ref) {
          return fields[i];
        }
      }
      return null;
    },
    getAssocValueById: function(fields, idFiel) {
      for (var i in fields) {
        if (fields[i].path == idFiel) {
          if (fields[i].options.ref == idFiel.substr(0, idFiel.length - 2)
            || fields[i].options.ref == idFiel.substr(0, idFiel.length - 3)) {
            return fields[i];
          }
        }
      }
      return null;
    }
  }
};