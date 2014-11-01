describe('Basic usage', function() {
  var Canguro;
  
  before(function(done) {
    Canguro = require('../index');

    return Canguro.init({ name: 'canguro_basic_test_' + Date.now() }).then(function(version) {
      done();
    });
  });

  it('should have an empty object called mappedModels', function(done) {
    expect(Canguro.mappedModels).to.be.empty();

    done();
  });
});