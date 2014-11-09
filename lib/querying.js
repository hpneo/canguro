var Inflecta = require('inflecta'),
    Canguro = require('./index'),
    Relation = require('./relation'),
    Sql = require('sql'),
    SQL = new Sql.Sql('sqlite');

var Querying = {
  staticMethods: {},
  instanceMethods: {}
};

Querying.load = function(query, callback) {
  var promise = new global.window.Promise(function(resolve, reject) {
    Canguro.getDatabase().transaction(function(transaction) {
      transaction.executeSql(query.text, query.values, function(transaction, results) {
        resolve(callback(results.rows));
      }, function(error) {
        reject(error);
      });
    });
  });

  return promise;
};

Querying.loadRows = function(model, query) {
  return Querying.load(query, function(rows) {
    var models = [];

    console.log(rows);

    for (var i = 0; i < rows.length; i++) {
      models.push(new model(rows.item(i)));
    }

    return models;
  });
};

Querying.loadScalar = function(query) {
  return Querying.load(query, function(rows) {
    var key = Object.keys(rows.item(0))[0];
    return rows.item(0)[key];
  });
};

Querying.staticMethods.all = function() {
  var table = SQL.define({
    name: this.tableName,
    columns: this.modelAttributes
  });

  return Querying.loadRows(this, table.select(table.star()).from(table).toQuery());
};

Querying.staticMethods.find = function(id) {
  var table = SQL.define({
    name: this.tableName,
    columns: this.modelAttributes
  });

  return Querying.loadRows(this, table.select(table.star()).from(table).where(table.id.equals(id)).toQuery()).then(function(rows) {
    return rows[0] || null;
  });
};

Querying.staticMethods.count = function() {
  var count = SQL.functions.COUNT,
      table = SQL.define({
        name: this.tableName,
        columns: this.modelAttributes
      });

  return Querying.loadScalar(table.select(count(table.id)).toQuery());
};

Querying.staticMethods.where = function(conditions) {
  var table = SQL.define({
    name: this.tableName,
    columns: this.modelAttributes
  });

  if (typeof conditions === 'string') {
    conditions = [conditions];
  }

  return new Relation({
    model: this,
    table: this.tableName,
    values: {
      where: conditions
    }
  });
};

module.exports = Querying;