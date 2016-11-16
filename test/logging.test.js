var expect = require('chai').expect;
var rewire = require('rewire');
var logger = rewire('../lib/outputLib');

describe('logging', function() {

    it('should not error if no logger has been provided', function(done) {

        logger.__get__('processMessage')('dummy message', 'missingLogLevel');

        done();
    });

});
