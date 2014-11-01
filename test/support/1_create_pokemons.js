module.exports = {
  up: function(migration) {
    migration.createTable('pokemons', {
      name: 'string',
      level: 'integer',
      pokemon_type_id: 'integer'
    }, {
      useTimestamps: true
    });
  },
  down: function(migration) {
    migration.dropTable('pokemons');
  }
};