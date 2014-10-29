describe('Models', function() {
  var Canguro;
  
  before(function(done) {
    Canguro = require('../index');

    return Canguro.init({ name: 'canguro_models_test_' + Date.now() }).then(function(version) {
      console.log('current database version', version);
      done();
    });
  });

  it('should create models', function(done) {
    var Pokemon = Canguro.defineModel('Pokemon');

    var blastoise = new Pokemon();

    blastoise.constructor.tableName.should.equal('pokemons');
    Object.keys(Canguro.mappedModels).should.have.length(1);

    done();
  });
});