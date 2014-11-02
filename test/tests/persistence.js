describe('Persistence', function() {
  var Canguro;
  var fs = require('fs');
  
  before(function(done) {
    Canguro = require('../index');

    fs.writeFileSync('migrations/1_create_pokemons.js', fs.readFileSync('support/1_create_pokemons.js'));

    return Canguro.init({ name: 'canguro_persistence_test_' + Date.now() }).then(function(version) {
      console.log(Canguro.options.name);
      done();
    });
  });

  after(function(done) {
    Canguro.database = null;
    Canguro.options = null;
    
    fs.unlinkSync('migrations/1_create_pokemons.js');

    done();
  });

  it('should persist new models', function(done) {
    var Pokemon = Canguro.defineModel('Pokemon');
    
    var bulbasaur = new Pokemon({
      name: 'Bulbasaur',
      level: 6
    });

    bulbasaur.save().then(function() {
      expect(bulbasaur.id).to.be.a('number');
      expect(bulbasaur.createdAt).to.be.a(Date);
      expect(bulbasaur.updatedAt).to.be.a(Date);
      expect(bulbasaur.createdAt.getTime()).to.be(bulbasaur.updatedAt.getTime());
    }, function() {
      console.log('error', arguments);
    });

    done();
  });
});