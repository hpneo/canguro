module.exports = {
  up: function(migration) {
    migration.createTable('pokemons', {
      name: 'string',
      level: 'integer'
    }, {
      useTimestamps: true
    });
  },
  down: function(migration) {
    migration.dropTable('pokemons');
  }
};