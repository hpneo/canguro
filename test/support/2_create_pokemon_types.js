module.exports = {
  up: function(migration) {
    migration.createTable('pokemon_types', {
      name: 'string'
    }, {
      useTimestamps: true
    });
  },
  down: function(migration) {
    migration.dropTable('pokemon_types');
  }
};