describe('Migrations', function() {
  var Canguro;
  var fs = require('fs');
  
  before(function(done) {
    Canguro = require('../index');

    fs.writeFileSync('migrations/1_create_pokemons.js', fs.readFileSync('support/1_create_pokemons.js'));

    return Canguro.init({ name: 'canguro_migrations_test_' + Date.now() }).then(function(version) {
      done();
    });
  });

  after(function(done) {
    Canguro.database = null;
    Canguro.options = null;
    
    fs.unlink('migrations/1_create_pokemons.js', done);
  });

  it('should support migrations', function(done) {
    expect(localStorage.getItem('schema:' + Canguro.options.name + ':pokemons')).to.be.a('string');

    done();
  });
});