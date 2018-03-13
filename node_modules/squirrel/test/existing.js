var squirrel = require('../'),
    assert = require('assert');
    
describe('require existing modules check', function() {
    it('should be able to successfully include a module that exists already', function(done) {
        squirrel('read', function(err, read) {
            assert(read);
            done(err);
        });
    });
    
    it('should be able to include multiple modules in a single call', function(done) {
        squirrel(['read', 'underscore'], function(err, read, _) {
            assert.ifError(err);
            assert(read);
            assert(_);
            done(err);
        });
    });
});