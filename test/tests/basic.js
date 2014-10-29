describe('Basic usage', function() {
  var Canguro;
  
  before(function(done) {
    Canguro = require('../index');

    return Canguro.init({ name: 'canguro_basic_test_' + Date.now() }).then(function(version) {
      console.log('current database version', version);
      done();
    });
  });

  it('should have an empty object called mappedModels', function(done) {
    Object.keys(Canguro.mappedModels).should.have.length(0);

    done();
  });

  it('should support migrations', function(done) {
    localStorage.getItem('schema:pokemons').should.be.type('string');

    done();
  });
});