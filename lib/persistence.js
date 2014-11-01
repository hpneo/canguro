require('sugar');

var Canguro = require('./index'),
    Sql = require('sql'),
    SQL = new Sql.Sql('sqlite');

var Persistence = {
  staticMethods: {},
  instanceMethods: {}
};

Persistence.staticMethods.create = function(instanceAttributes) {
  var newRecord = new this(instanceAttributes);

  return newRecord.create();
};

Persistence.instanceMethods.create = function() {
  var table = SQL.define({
    name: this.constructor.tableName,
    columns: this.constructor.modelAttributes
  });

  var self = this,
      argumentsForQuery = [];

  this.constructor.modelAttributes.exclude('id', 'createdAt', 'updatedAt').forEach(function(attribute) {
    argumentsForQuery.push(table[attribute].value(self[attribute]));
  });

  var now = Date.now();

  argumentsForQuery.push(table['createdAt'].value(now));
  argumentsForQuery.push(table['updatedAt'].value(now));

  var query = table.insert.apply(table, argumentsForQuery).toQuery();

  var promise = new global.window.Promise(function(resolve, reject) {
    Canguro.getDatabase().transaction(function(transaction) {
      transaction.executeSql(query.text, query.values, function(transaction, results) {
        self.id = results.insertId;
        self.createdAt = self.updatedAt = new Date(now);

        resolve(self);
      }, function(transaction, error) {
        reject(error);
      });
    });
  });

  return promise;
};

Persistence.instanceMethods.update = function() {
  var table = SQL.define({
    name: this.constructor.tableName,
    columns: this.constructor.modelAttributes
  });

  var self = this,
      argumentsForQuery = {};

  this.constructor.modelAttributes.exclude('id', 'createdAt', 'updatedAt').forEach(function(attribute) {
    argumentsForQuery[attribute] = self[attribute];
  });

  var now = Date.now();

  argumentsForQuery['updatedAt'] = now;

  var query = table.update(argumentsForQuery).where(table.id.equals(this.id)).toQuery();

  var promise = new global.window.Promise(function(resolve, reject) {
    Canguro.getDatabase().transaction(function(transaction) {
      transaction.executeSql(query.text, query.values, function(transaction, results) {
        self.updatedAt = new Date(now);

        resolve(self);
      }, function(transaction, error) {
        reject(error);
      });
    });
  });

  return promise;
};

Persistence.instanceMethods.save = function() {
  if (this.id === null || this.id === undefined) {
    return this.create();
  }
  else {
    return this.update();
  }
};

Persistence.instanceMethods.destroy = function() {
  var table = SQL.define({
    name: this.constructor.tableName,
    columns: this.constructor.modelAttributes
  });

  var self = this;

  var query = table.delete().where(table.id.equals(this.id)).toQuery();

  var promise = new global.window.Promise(function(resolve, reject) {
    Canguro.getDatabase().transaction(function(transaction) {
      transaction.executeSql(query.text, query.values, function(transaction, results) {
        resolve(self);
      }, function(transaction, error) {
        reject(error);
      });
    });
  });

  return promise;
};

module.exports = Persistence;