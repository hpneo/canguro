var Inflecta = require('inflecta'),
    Canguro = require('./index'),
    Statements = require('./statements'),
    Sql = require('sql'),
    SQL = new Sql.Sql('sqlite');

var Relation = function Relation(options) {
  this.model = options.model;
  this.table = options.table;
  this.owner = options.owner;
  this.fields = options.fields || [];
  this.values = options.values || {};
  this.records = options.records || [];

  var table = SQL.define({
                name: this.table,
                columns: this.model.modelAttributes
              });

  var self = this;

  var conditionsArray = [];

  if (Array.isArray(options.values.where)) {
    this.values.where = options.values.where;
  }
  else {
    Object.keys(options.values.where).forEach(function(key) {
      conditionsArray.push([key, options.values.where[key]]);
    });

    this.values.where = conditionsArray;
  }

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

  relation.values.where.forEach(function(condition) {
    if (typeof condition === 'string') {
      query = query.where(table.literal(condition));
    }
    else {
      query = query.where(table[condition[0]].equals(condition[1]));
    }
  });

  return query;
};

Relation.prototype = Object.create(Array.prototype);

Relation.prototype.push = function(record) {
  if (this.fields && this.fields.length === 2) {
    record[this.fields[0]] = this.owner[this.fields[1]];

    // this need to be improved or removed
    if (this.fields[0].indexOf('_id') > -1) {
      record[this.fields[0].replace('_id', '')] = this.owner;
    }
  }

  if (this.records.indexOf(record) === -1) {
    this.records.push(record);
  }

  if (this.indexOf(record) === -1) {
    Array.prototype.push.call(this, record);
  }
}

Relation.prototype.toQuery = function() {
  return this.query.toQuery();
};

Relation.prototype.reset = function() {
  this.records.length = 0;
  this.length = 0;

  return this;
};

Relation.prototype.where = function(conditions) {
  this.values.where = this.values.where || [];

  var keys = Object.keys(conditions),
      self = this;

  keys.forEach(function(key) {
    self.values.where.push([key, conditions[key]]);
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

Relation.prototype.reload = function() {
  if (this.fields.length === 2) {
    this.values.where[this.fields[0]] = this.owner[this.fields[1]];
  }

  this.query = buildQuery(this);
  
  return this;
}

module.exports = Relation;