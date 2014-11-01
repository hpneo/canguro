var Canguro = require('./index'),
    Statements = require('./statements');

var Migration = function(version) {
  this.version = version;
  this.operations = [];
};

Migration.prototype.createTable = function(tableName, columns, tableOptions) {
  console.log('Creating table:', tableName);
  this.operations.push(Statements.createTable(tableName, columns, tableOptions));
};

Migration.prototype.dropTable = function(tableName) {
  console.log('Dropping table:', tableName);
  this.operations.push(Statements.dropTable(tableName));
};

Migration.prototype.addColumn = function(tableName, columnName, columnType) {
  console.log('Adding column `' + columnName + '` to ' + tableName);
  this.operations.push(Statements.addColumn(tableName, columnName, columnType));
};

Migration.prototype.dropColumn = function(tableName, columnName) {
  console.log('Dropping column `' + columnName + '` from ' + tableName);
  this.operations.push(Statements.dropColumn(tableName, columnName));
};

Migration.prototype.run = function() {
  var operations = this.operations,
      version = this.version;

  var promise = new global.window.Promise(function(resolve, reject) {
    Canguro.getDatabase().transaction(function(transaction) {
      operations.forEach(function(operation, index) {
        console.log('Running:', operation);
        
        transaction.executeSql(operation, [], function() {
          if (index === operations.length - 1) {
            global.window.localStorage.setItem('migrations:' + Canguro.options.name + ':version', version);
            resolve(operations);
          }
        }, function(tx, error) {
          reject(error);
        });
      });
    });
  });

  return promise;
};

module.exports = Migration;