describe('Associations', function() {
  var Canguro,
      PokemonType,
      Pokemon;
  var fs = require('fs');
  
  before(function(done) {
    Canguro = require('../index');

    fs.writeFileSync('migrations/1_create_pokemons.js', fs.readFileSync('support/1_create_pokemons.js'));
    fs.writeFileSync('migrations/2_create_pokemon_types.js', fs.readFileSync('support/2_create_pokemon_types.js'));

    return Canguro.init({ name: 'canguro_associations_test_' + Date.now() }).then(function(version) {
      done();

      PokemonType = Canguro.defineModel('PokemonType', function() {
        this.hasMany('pokemons');
      });

      Pokemon = Canguro.defineModel('Pokemon', function() {
        this.belongsTo('pokemon_type');
      });
    });
  });

  after(function(done) {
    Canguro.database = null;
    Canguro.options = null;
    
    fs.unlinkSync('migrations/1_create_pokemons.js');
    fs.unlinkSync('migrations/2_create_pokemon_types.js');

    done();
  });

  it('should support associations between models', function(done) {
    expect(PokemonType.modelAssociations.hasMany).to.have.property('pokemons');
    expect(Pokemon.modelAssociations.belongsTo).to.have.property('pokemon_type');

    done();
  });

  it('should support belongsTo associations', function(done) {
    var blastoise = new Pokemon({
      id: 123,
      name: 'Blastoise',
      level: 24
    });

    var waterType = new PokemonType({
      id: 456,
      name: 'Water'
    });

    expect(blastoise).to.have.property('pokemon_type');

    blastoise.pokemon_type = waterType;

    expect(blastoise.pokemon_type.first()).to.be(waterType);
    expect(blastoise.pokemon_type_id).to.be(waterType.id);
    
    done();
  });

  it('should support hasMany associations', function(done) {
    var charmander = new Pokemon({
      id: 987,
      name: 'Charmander',
      level: 12
    });

    var fireType = new PokemonType({
      id: 654,
      name: 'Fire'
    });

    expect(fireType).to.have.property('pokemons');

    fireType.pokemons.push(charmander);

    expect(fireType.pokemons.first()).to.be(charmander);
    expect(charmander.pokemon_type_id).to.be(fireType.id);
    
    done();
  });
});