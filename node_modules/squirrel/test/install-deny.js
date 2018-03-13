var squirrel = require('../');
var assert = require('assert');
var expect = require('expect.js');

describe('deny installation tests', function() {
    after(function(done) {
        squirrel.rm(['out', 'lodash', 'coffee-script', 'jade'], done);
    });
    
    it('should not be able to install nopt', function(done) {
        squirrel('out', { allowInstall: false }, function(err, nopt) {
            assert(err);
            expect(err.message).to.contain('Not permitted');
            done();
        });
    });
    
    it('should return an error when installed and not-installable externals are requested', function(done) {
        squirrel(['pull-stream', 'out'], { allowInstall: false }, function(err, debug, nopt) {
            expect(err).to.be.ok();
            expect(err.message).to.contain('Not permitted');
            done();
        });
    });
    
    it('should not be able to install multiple modules', function(done) {
        squirrel(['out', 'fui'], { allowInstall: false }, function(err, nopt, matchme) {
            expect(err).to.be.ok();
            expect(err.message).to.contain('Not permitted');
            done();
        });
    });
});