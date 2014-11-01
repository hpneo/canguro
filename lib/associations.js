var Inflecta = require('inflecta'),
    Canguro = require('./index'),
    Relation = require('./relation');
var Associations = {};

Associations.hasMany = function(name, options) {
  options = options || {};

  var modelConstructor = this,
      tableName = Inflecta.tableize(name);

  var propertyModel = Canguro.mappedModels[tableName] || options['model'],
      propertyName = options['as'] || name;

  this.modelAssociations.hasMany[name] = {
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

      if (this.associations.hasMany[name] === undefined) {
        if (modelConstructor.modelAssociations.hasMany[name].model === undefined) {
          modelConstructor.modelAssociations.hasMany[name].model = Canguro.mappedModels[tableName];
        }

        var conditions = {};
        conditions[Inflecta.singularize(modelConstructor.tableName) + '_id'] = this.id;

        this.associations.hasMany[name] = new Relation({
          owner: this,
          model: Canguro.mappedModels[tableName],
          table: name,
          fields: [Inflecta.singularize(modelConstructor.tableName) + '_id', 'id'],
          values: {
            where: conditions
          }
        });
      }

      return this.associations.hasMany[name];
    }
  });
};

Associations.belongsTo = function(name, options) {
  options = options || {};

  var modelConstructor = this,
      tableName = Inflecta.tableize(name);

  var propertyModel = Canguro.mappedModels[tableName] || options['model'],
      propertyName = options['as'] || name;

  this.modelAssociations.belongsTo[name] = {
    model: propertyModel,
    as: propertyName
  };

  Object.defineProperty(modelConstructor.prototype, propertyName, {
    configurable: false,
    enumerable: true,
    set: function(record) {
      if (modelConstructor.modelAssociations.belongsTo[name].model === undefined) {
        modelConstructor.modelAssociations.belongsTo[name].model = Canguro.mappedModels[tableName];
      }

      if (record.id !== undefined) {
        this[Inflecta.singularize(name) + '_id'] = record.id;
      }

      var conditions = {};
      conditions.id = this[Inflecta.singularize(name) + '_id'];

      this.associations.belongsTo[name] = new Relation({
        owner: this,
        model: Canguro.mappedModels[tableName],
        table: tableName,
        fields: ['id', Inflecta.singularize(name) + '_id'],
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

      if (modelConstructor.modelAssociations.belongsTo[name].model === undefined) {
        modelConstructor.modelAssociations.belongsTo[name].model = Canguro.mappedModels[tableName];
      }
      
      if (this.associations.belongsTo[name] === undefined) {
        var conditions = {};
        conditions.id = this[Inflecta.singularize(name) + '_id'];
        
        this.associations.belongsTo[name] = new Relation({
          owner: this,
          model: Canguro.mappedModels[tableName],
          table: tableName,
          fields: ['id', Inflecta.singularize(name) + '_id'],
          values: {
            where: conditions,
            oneResult: true
          }
        });
      }

      return this.associations.belongsTo[name];
    }
  });
};

module.exports = Associations;