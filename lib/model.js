var Inflecta = require('inflecta'),
    Canguro = require('./index'),
    Querying = require('./querying'),
    Persistence = require('./persistence'),
    Associations = require('./associations');

var Model = {};

Model.defineSchema = function(modelConstructor) {
  var schema = JSON.parse(global.window.localStorage.getItem('schema:' + Canguro.options.name + ':' + modelConstructor.tableName)) || [];
  modelConstructor.modelAttributes = [];

  modelConstructor.defineProperty = function(columnName, getter, setter) {
    Object.defineProperty(modelConstructor.prototype, columnName, {
      configurable: true,
      enumerable: true,
      get: getter,
      set: (setter || function() {})
    });
  };

  schema.forEach(function(column) {
    modelConstructor.modelAttributes.push(column['name']);

    Object.defineProperty(modelConstructor.prototype, column['name'], {
      configurable: false,
      enumerable: true,
      get: function() {
        this.attributes = this.attributes || {};
        return this.attributes[column['name']] || null;
      },
      set: function(value) {
        this.attributes = this.attributes || {};
        this.attributes[column['name']] = value;

        var belongsToKeys = Object.keys(this.associations.belongsTo);

        for (var i = 0; i < belongsToKeys.length; i++) {
          var association = this.associations.belongsTo[belongsToKeys[i]];

          if (association.fields && association.fields.length === 2 && association.fields[1] === column['name']) {
            association.reload();
            break;
          }
        }
      }
    });
  });

  return modelConstructor;
};

Model.define = function(modelName, modelOptions) {
  var ModelConstructor = function Model(attributes) {
    this.attributes = {};
    this.associations = {
      hasMany: {},
      belongsTo: {}
    };

    for (var i in attributes) {
      if (this.constructor.modelAttributes.indexOf(i) > -1) {
        this.attributes[i] = attributes[i];
      }
    }

    if (typeof this.attributes.createdAt === 'number') {
      this.attributes.createdAt = new Date(this.attributes.createdAt);
    }

    if (typeof this.attributes.updatedAt === 'number') {
      this.attributes.updatedAt = new Date(this.attributes.updatedAt);
    }
  };

  ModelConstructor.tableName = Inflecta.tableize(modelName);
  Canguro.mappedModels[ModelConstructor.tableName] = ModelConstructor;

  Model.defineSchema(ModelConstructor);

  Object.keys(Querying.staticMethods).forEach(function(staticMethod) {
    ModelConstructor[staticMethod] = Querying.staticMethods[staticMethod];
  });

  Object.keys(Persistence.staticMethods).forEach(function(staticMethod) {
    ModelConstructor[staticMethod] = Persistence.staticMethods[staticMethod];
  });

  Object.keys(Persistence.instanceMethods).forEach(function(instanceMethod) {
    ModelConstructor.prototype[instanceMethod] = Persistence.instanceMethods[instanceMethod];
  });

  ModelConstructor.prototype.toJSON = function() {
    var json = {};

    var attributesKeys = Object.keys(this.attributes),
        hasManyKeys = Object.keys(this.associations.hasMany),
        belongsToKeys = Object.keys(this.associations.belongsTo);

    for (var i = 0; i < attributesKeys.length; i++) {
      json[attributesKeys[i]] = this.attributes[attributesKeys[i]];
    }

    for (var i = 0; i < hasManyKeys.length; i++) {
      json[hasManyKeys[i]] = this.associations.hasMany[hasManyKeys[i]].map(function(item) {
        return item.toJSON();
      });
    }

    for (var i = 0; i < belongsToKeys.length; i++) {
      json[belongsToKeys[i]] = this.associations.belongsTo[belongsToKeys[i]][0].toJSON();
    }

    return json;
  };

  if (modelOptions instanceof global.window.Function) {
    ModelConstructor.modelAssociations = {
      hasMany: {},
      belongsTo: {}
    };
    
    ModelConstructor.hasMany = Associations.hasMany;
    ModelConstructor.belongsTo = Associations.belongsTo;

    modelOptions.call(ModelConstructor);
  }

  return ModelConstructor;
};

module.exports = Model;