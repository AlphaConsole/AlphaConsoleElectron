var squirrel = require('../'),
    expect = require('expect.js');

describe('installable module tests', function() {
    before(function(done) {
        // initialise the squirrel options to allow installation
        squirrel.defaults.allowInstall = true;
        squirrel.rm(['nopt', 'matchme'], done);
    });
    
    afterEach(function(done) {
        squirrel.rm(['nopt', 'matchme', 'coffee-script', 'jade'], done);
    });
    
    it('should be able to install nopt', function(done) {
        squirrel('nopt', { allowInstall: true }, function(err, nopt) {
            expect(nopt).to.be.ok();
            done(err);
        });
    });
    
    it('should be able to deal with both installed and uninstalled modules', function(done) {
        squirrel(['debug', 'nopt'], { allowInstall: true }, function(err, debug, nopt) {
            expect(debug).to.be.ok();
            expect(nopt).to.be.ok();
            done(err);
        });
    });
    
    it('should be able to install multiple modules', function(done) {
        squirrel(['nopt', 'matchme'], { allowInstall: true }, function(err, nopt, matchme) {
            expect(nopt).to.be.ok();
            expect(matchme).to.be.ok();
            done(err);
        });
    });
    
    it('should be able to install the demo dependencies', function(done) {
        squirrel(['coffee-script', 'jade'], { allowInstall: true }, function(err, coffee, jade) {
            expect(coffee).to.be.ok();
            expect(typeof coffee.compile).to.equal('function');
            expect(jade).to.be.ok();
            done(err);
        });
    });
});