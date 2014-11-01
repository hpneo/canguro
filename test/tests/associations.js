describe('Associations', function() {
  var Canguro;
  var fs = require('fs');
  
  before(function(done) {
    Canguro = require('../index');

    fs.writeFileSync('migrations/1_create_pokemons.js', fs.readFileSync('support/1_create_pokemons.js'));
    fs.writeFileSync('migrations/2_create_pokemon_types.js', fs.readFileSync('support/2_create_pokemon_types.js'));

    return Canguro.init({ name: 'canguro_associations_test_' + Date.now() }).then(function(version) {
      done();
    });
  });

  after(function(done) {
    fs.unlinkSync('migrations/1_create_pokemons.js');
    fs.unlinkSync('migrations/2_create_pokemon_types.js');
    Canguro.options = null;

    done();
  });

  it('should support associations between models', function(done) {
    var PokemonType = Canguro.defineModel('PokemonType', function() {
      this.hasMany('pokemons');
    });

    var Pokemon = Canguro.defineModel('Pokemon', function() {
      this.belongsTo('pokemon_type');
    });

    expect(PokemonType.modelAssociations.hasMany).to.have.property('pokemons');
    expect(Pokemon.modelAssociations.belongsTo).to.have.property('pokemon_type');

    var blastoise = new Pokemon({
      name: 'Blastoise',
      level: 24
    });

    var waterType = new PokemonType({
      name: 'Water'
    });

    expect(blastoise).to.have.property('pokemon_type');
    expect(waterType).to.have.property('pokemons');
    
    // blastoise.pokemon_type_id = 123;
    // console.log(blastoise.pokemon_type.toQuery());
    // reload relation after setting attribute associated to belongsTo

    done();
  });
});