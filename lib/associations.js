var Inflecta = require('inflecta'),
    Canguro = require('./index'),
    Relation = require('./relation');
var Associations = {};

Associations.hasMany = function(tableName, options) {
  options = options || {};

  var modelConstructor = this;

  var propertyModel = Canguro.mappedModels[Inflecta.tableize(tableName)] || options['model'],
      propertyName = options['as'] || tableName;

  this.associations.hasMany[tableName] = {
    model: propertyModel,
    as: propertyName
  };

  Object.defineProperty(modelConstructor.prototype, propertyName, {
    configurable: false,
    enumerable: true,
    get: function() {
      this.associations = this.associations || {
        hasMany: {},
        belongsTo: {}
      };

      if (this.associations.hasMany[tableName] === undefined) {
        if (modelConstructor.associations.hasMany[tableName].model === undefined) {
          modelConstructor.associations.hasMany[tableName].model = Canguro.mappedModels[Inflecta.tableize(tableName)];
        }

        var conditions = {};
        conditions[Inflecta.singularize(modelConstructor.tableName) + '_id'] = this.id;

        this.associations.hasMany[tableName] = new Relation({
          model: Canguro.mappedModels[Inflecta.tableize(tableName)],
          table: tableName,
          values: {
            where: conditions
          }
        });
      }

      return this.associations.hasMany[tableName];
    }
  });
};

Associations.belongsTo = function(tableName, options) {
  options = options || {};

  var modelConstructor = this;

  var propertyModel = Canguro.mappedModels[Inflecta.tableize(tableName)] || options['model'],
      propertyName = options['as'] || tableName;

  this.associations.belongsTo[tableName] = {
    model: propertyModel,
    as: propertyName
  };

  Object.defineProperty(modelConstructor.prototype, propertyName, {
    configurable: false,
    enumerable: true,
    set: function(record) {
      if (modelConstructor.associations.belongsTo[tableName].model === undefined) {
        modelConstructor.associations.belongsTo[tableName].model = Canguro.mappedModels[Inflecta.tableize(tableName)];
      }

      var conditions = {};
      conditions['id'] = this[Inflecta.singularize(tableName) + '_id'];

      if (record.id !== undefined) {
        this[Inflecta.singularize(tableName) + '_id'] = record.id;
      }

      this.associations.belongsTo[tableName] = new Relation({
        model: Canguro.mappedModels[Inflecta.tableize(tableName)],
        table: Inflecta.tableize(tableName),
        records: [record],
        values: {
          where: conditions,
          oneResult: true
        }
      });
    },
    get: function() {
      this.associations = this.associations || {
        hasMany: {},
        belongsTo: {}
      };

      if (modelConstructor.associations.belongsTo[tableName].model === undefined) {
        modelConstructor.associations.belongsTo[tableName].model = Canguro.mappedModels[Inflecta.tableize(tableName)];
      }
      if (this.associations.belongsTo[tableName] === undefined) {
        var conditions = {};
        conditions['id'] = this[Inflecta.singularize(tableName) + '_id'];

        this.associations.belongsTo[tableName] = new Relation({
          model: Canguro.mappedModels[Inflecta.tableize(tableName)],
          table: Inflecta.tableize(tableName),
          values: {
            where: conditions,
            oneResult: true
          }
        });
      }

      return this.associations.belongsTo[tableName];
    }
  });
};

module.exports = Associations;