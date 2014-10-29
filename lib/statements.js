var Statements = {},
    Sql = require('sql'),
    SQL = new Sql.Sql('sqlite');

Statements.DATA_TYPES = {
  string: 'TEXT',
  text: 'TEXT',
  integer: 'INTEGER',
  real: 'REAL',
  blob: 'BLOB',
  date: 'INTEGER',
  time: 'INTEGER'
};

Statements.createTable = function(tableName, columns, tableOptions) {
  var columnOptions = [{
    type: 'integer',
    name: 'id',
    primaryKey: true
  }];

  for (var columnName in columns) {
    var columnOption = {};
    
    if (typeof columns[columnName] === 'string') {
      columnOption['type'] = columns[columnName];
    }
    else {
      columnOption = columns[columnName];
    }

    columnOption['name'] = columnName;
    columnOption['type'] = columnOption['type'];

    columnOptions.push(columnOption);

    if (columnOption['type'] === 'reference') {
      columnOption['name'] = columnOption['name'] + '_id';
      columnOption['type'] = 'integer';
    }
  }

  if (tableOptions['useTimestamps'] === true) {
    columnOptions.push({
      type: 'date',
      name: 'createdAt'
    });

    columnOptions.push({
      type: 'date',
      name: 'updatedAt'
    });
  }

  var columnStatements = [];

  for (var i = 0; i < columnOptions.length; i++) {
    var columnOption = columnOptions[i],
        columnStatement = columnOption['name'] + ' ' + Statements.DATA_TYPES[columnOption['type']];

    if (columnOption['primaryKey'] === true) {
      columnStatement += ' PRIMARY KEY';
    }

    if (columnOption['default'] !== undefined) {
      if (typeof columnOption['default'] === 'string' || typeof columnOption['default'] === 'integer') {
        columnStatement += ' DEFAULT ' + JSON.stringify(columnOption['default']);
      }
    }

    columnStatements.push(columnStatement);
  }

  global.window.localStorage.setItem('schema:' + tableName, JSON.stringify(columnOptions));

  return 'CREATE TABLE IF NOT EXISTS ' + tableName + ' (\n' + columnStatements.join(',\t\n') + '\n);';
};

Statements.dropTable = function(tableName) {
  return 'DROP TABLE ' + tableName;
};

Statements.addColumn = function(tableName, columnName, columnType) {
  var table = SQL.define({
    name: tableName,
    columns: Statements.storageToSQL(tableName)
  });

  var tableSchemaInStorage = JSON.parse(global.window.localStorage.getItem('schema:' + tableName));
  tableSchemaInStorage.push({
    type: columnType,
    name: columnName
  });

  global.window.localStorage.setItem('schema:' + tableName, JSON.stringify(tableSchemaInStorage));

  return table.alter().addColumn(columnName, Statements.DATA_TYPES[columnType]).toQuery().text;
};

Statements.dropColumn = function(tableName, columnName) {
  var table = SQL.define({
    name: tableName,
    columns: Statements.storageToSQL(tableName)
  });

  // TO DO: Update schema

  return table.alter().addColumn(columnName).toQuery().text;
};

Statements.loadMany = function(table, foreignKey) {
  return 'SELECT * FROM ' + table + ' WHERE ' + foreignKey + ' = ?;';
};

Statements.storageToSQL = function(tableName) {
  var tableSchema = JSON.parse(global.window.localStorage.getItem('schema:' + tableName));

  tableSchema.forEach(function(column) {
    column.dataType = Statements.DATA_TYPES[column.type];
    delete column.type;
  });

  return tableSchema;
}

module.exports = Statements;