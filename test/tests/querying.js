describe('Querying', function() {
  var Canguro;
  var PokemonType,
      Pokemon;
  var bulbasaur,
      ivysaur,
      venasaur,
      charmander,
      charmeleon,
      charizard,
      squirtle,
      wartortle,
      blastoise,
      waterType,
      fireType,
      grassType

  var fs = require('fs');
  
  before(function(done) {
    Canguro = require('../index');

    fs.writeFileSync('migrations/1_create_pokemons.js', fs.readFileSync('support/1_create_pokemons.js'));
    fs.writeFileSync('migrations/2_create_pokemon_types.js', fs.readFileSync('support/2_create_pokemon_types.js'));

    return Canguro.init({ name: 'canguro_querying_test_' + Date.now() }).then(function(version) {
      PokemonType = Canguro.defineModel('PokemonType', function() {
        this.hasMany('pokemons');
      });

      Pokemon = Canguro.defineModel('Pokemon', function() {
        this.belongsTo('pokemon_type');
      });
    
      bulbasaur = new Pokemon({
        name: 'Bulbasaur',
        level: 6
      }),
      ivysaur = new Pokemon({
        name: 'Ivysaur',
        level: 18
      }),
      venasaur = new Pokemon({
        name: 'Venasaur',
        level: 32
      }),
      charmander = new Pokemon({
        name: 'Charmander',
        level: 12
      }),
      charmeleon = new Pokemon({
        name: 'Charmeleon',
        level: 16
      }),
      charizard = new Pokemon({
        name: 'Charizard',
        level: 36
      }),
      squirtle = new Pokemon({
        name: 'Squirtle',
        level: 8
      }),
      wartortle = new Pokemon({
        name: 'Wartortle',
        level: 24,
      }),
      blastoise = new Pokemon({
        name: 'Blastoise',
        level: 40
      });

      waterType = new PokemonType({
        name: 'Water'
      }),
      fireType = new PokemonType({
        name: 'Fire'
      }),
      grassType = new PokemonType({
        name: 'Grass'
      });

      var waterTypePromise = waterType.save().then(function() {
        squirtle.pokemon_type = waterType;
        wartortle.pokemon_type = waterType;
        blastoise.pokemon_type = waterType;

        return Promise.all([squirtle.save(), wartortle.save(), blastoise.save()]);
      });

      var fireTypePromise = fireType.save().then(function() {
        charmander.pokemon_type = fireType;
        charmeleon.pokemon_type = fireType;
        charizard.pokemon_type = fireType;

        return Promise.all([charmander.save(), charmeleon.save(), charizard.save()]);
      });

      var grassTypePromise = grassType.save().then(function() {
        bulbasaur.pokemon_type = grassType;
        ivysaur.pokemon_type = grassType;
        venasaur.pokemon_type = grassType;

        return Promise.all([bulbasaur.save(), ivysaur.save(), venasaur.save()]);
      });

      Promise.all([waterTypePromise, fireTypePromise, grassTypePromise]).then(function(){
        done();
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

  it('should support querying from hasMany associations', function(done) {
    grassType.pokemons.load().then(function(pokemons) {
      expect(pokemons).to.have.length(3);
    });

    fireType.pokemons.where({ name: 'Charmeleon' }).load().then(function(pokemons) {
      expect(pokemons).to.have.length(1);
    });

    waterType.pokemons.where({ level: 8 }).load().then(function(pokemons) {
      expect(pokemons).to.have.length(1);
    });

    done();
  });

  it ('should support querying from model constructor', function(done) {
    Pokemon.where({ pokemon_type_id: waterType.id, level: 40 }).load().then(function(pokemons) {
      expect(pokemons).to.have.length(1);
    });

    done();
  });

  it ('should support querying with strings', function(done) {
    Pokemon.where('level > 20').load().then(function(pokemons) {
      expect(pokemons).to.have.length(4);
    });

    done();
  });
});