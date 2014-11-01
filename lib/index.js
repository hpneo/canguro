var Inflecta = require('inflecta'),
    fs = require('fs'),
    path = require('path');

var Canguro = {
  mappedModels: {}
};

function runMigration(file) {
  var migrationFile = require(path.resolve('migrations/' + file)),
      migration = new Migration(file.split('_')[0]);

  migrationFile.up(migration);
  var promise = migration.run();

  return promise;
};

Canguro.getDatabase = function(options) {
  var options = options || Canguro.options;

  if (this.database === null || this.database === undefined) {
    this.database = global.window.openDatabase(options.name, options.version || '1.0', options.description || 'Database', options.size || 5 * 1024 * 1024);
  }

  return this.database;
};

Canguro.init = function(options) {
  Canguro.options = options;
  Canguro.defineModel = Canguro.defineModel || Model.define;
  
  var result;

  if (fs.existsSync('migrations')) {
    result = new global.window.Promise(function(resolve, reject) {
      fs.readdir('migrations', function(error, files) {
        if (error !== null) {
          reject(error);
        }
        else {
          var lastVersion = global.window.localStorage.getItem('migrations:version');

          if (lastVersion) {
            files = files.filter(function(item, index) {
              var version = item.split('_')[0];
              return version > lastVersion;
            });
          }

          result = global.window.Promise.resolve();

          files.forEach(function(file) {
            result = result.then(function() {
              return runMigration(file);
            }, function(error) {
              reject(error);
            });
          });

          result.then(function() {
            resolve(global.window.localStorage.getItem('migrations:version'));
          }).catch(function() {
            console.log(arguments);
          });
        }
      });
    });
  }
  else {
    global.window.localStorage.setItem('migrations:version', 0);
    result = global.window.Promise.resolve(0);
  }
  
  return result;
};

module.exports = Canguro;

var Migration = require('./migration'),
    Model = require('./model');