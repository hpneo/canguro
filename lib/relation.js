var Inflecta = require('inflecta'),
    Canguro = require('./index'),
    Statements = require('./statements'),
    Sql = require('sql'),
    SQL = new Sql.Sql('sqlite');

var Relation = function Relation(options) {
  this.model = options.model;
  this.table = options.table;
  this.values = options.values || {};
  this.values.where = this.values.where || {};
  this.records = options.records || [];

  var table = SQL.define({
                name: this.table,
                columns: this.model.modelAttributes
              });

  var self = this;

  this.query = buildQuery(this);

  if (this.values.oneResult === true) {
    this.query = this.query.limit(1);
  }

  if (this.records.length > 0) {
    this.length = 0;

    this.records.forEach(function(record, index) {
      self.push(record);
    });
  }
};

function buildQuery(relation) {
  var table = SQL.define({
    name: relation.table,
    columns: relation.model.modelAttributes
  });

  var query = table.select(table.star()).from(table);

  Object.keys(relation.values.where).forEach(function(key) {
    value = relation.values.where[key];
    query = query.where(table[key].equals(value));
  });

  return query;
};

Relation.prototype = Object.create(Array.prototype);

Relation.prototype.toQuery = function() {
  return this.query.toQuery();
};

Relation.prototype.reset = function() {
  this.records.length = 0;
  this.length = 0;

  return this;
};

Relation.prototype.where = function(conditions) {
  this.values.where = this.values.where || {};

  var keys = Object.keys(conditions),
      self = this;

  keys.forEach(function(key) {
    self.values.where[key] = conditions[key];
  });

  return this;
};

Relation.prototype.load = function() {
  var self = this,
      promise;

  if (this.records.length > 0) {
    promise = new global.window.Promise(function(resolve, reject) {
      self.length = 0;

      self.records.forEach(function(record, index) {
        self.push(record);
      });

      if (self.values.oneResult === true) {
        resolve(self[0]);
      }
      else {
        resolve(self);
      }
    });
  }
  else {
    this.query = buildQuery(this);

    promise = new global.window.Promise(function(resolve, reject) {
      Canguro.getDatabase().transaction(function(transaction) {
        transaction.executeSql(self.toQuery().text, self.toQuery().values, function(transaction, results) {
          self.length = 0;

          for (var i = 0; i < results.rows.length; i++) {
            self.push(new self.model(results.rows.item(i)));
          }

          if (self.values.oneResult === true) {
            resolve(self[0]);
          }
          else {
            resolve(self);
          }
        }, function(error) {
          reject(error);
        });
      });
    });
  }

  return promise;
};

module.exports = Relation;