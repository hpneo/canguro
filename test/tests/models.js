describe('Models', function() {
  var Canguro;
  var fs = require('fs');
  
  before(function(done) {
    Canguro = require('../index');

    fs.writeFileSync('migrations/1_create_pokemons.js', fs.readFileSync('support/1_create_pokemons.js'));

    return Canguro.init({ name: 'canguro_models_test_' + Date.now() }).then(function(version) {
      done();
    });
  });

  after(function(done) {
    Canguro.database = null;
    Canguro.options = null;
    
    fs.unlinkSync('migrations/1_create_pokemons.js');

    done();
  });

  it('should create models', function(done) {
    var Pokemon = Canguro.defineModel('Pokemon');
    
    var blastoise = new Pokemon();

    expect(blastoise.constructor.tableName).to.be('pokemons');
    expect(Object.keys(Canguro.mappedModels)).to.have.length(1);

    done();
  });

  it('should auto load attributes from schema', function(done) {
    var Pokemon = Canguro.defineModel('Pokemon');

    var blastoise = new Pokemon();

    expect(Pokemon.modelAttributes).to.contain('id');
    expect(Pokemon.modelAttributes).to.contain('name');
    expect(Pokemon.modelAttributes).to.contain('level');
    expect(Pokemon.modelAttributes).to.contain('createdAt');
    expect(Pokemon.modelAttributes).to.contain('updatedAt');

    expect(blastoise.id).not.to.be(undefined);
    expect(blastoise.name).not.to.be(undefined);
    expect(blastoise.level).not.to.be(undefined);
    expect(blastoise.createdAt).not.to.be(undefined);
    expect(blastoise.updatedAt).not.to.be(undefined);

    done();
  });
});