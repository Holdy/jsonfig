var expect = require('chai').expect;

var jsonfig = require('../jsonfig.js');
var path = require('path');

describe('chaining', function() {

    it('should build a chain of all types', function(done) {

        process.env['RB_BISCUITTIME'] = 'true';

        jsonfig.setLoggingFunction
            ('warn', console.log)
            ('info', console.log);

        var config = jsonfig.setup('root')
            .lookInEnvironment('RB')
            .lookInJson({
                'some-default': 45,
                'super-secret-password': 'shhhh...'})
            .lookInFile(path.resolve(__dirname, './testfiles/configFile1.json'));

        var wrappedValue = config.get('some-default');
        expect(wrappedValue.value).to.equal(45);

        wrappedValue = config.get('BISCUITTIME');
        expect(wrappedValue.value).to.equal('true');

        wrappedValue = config.get('MissingThing','someDefault');
        expect(wrappedValue.value).to.equal('someDefault');

        wrappedValue = config.get('super-secret-password');
        expect(wrappedValue.value).to.equal('shhhh...');

        wrappedValue = config.get('fileValue');
        expect(wrappedValue.value).to.equal(1234);

        var config = jsonfig.setup('filling')
            .lookInJson({'fillingValue': true})

        var subConfig = jsonfig.setup('sandwich')
            .lookInConfig('filling')
            .lookInJson({'firstValue': 1})
            .lookInJson({'secondChain': 2});

        var f = subConfig.get('firstValue');
        var bisc = subConfig.get('fillingValue');

        done();
    });


    it('should error if we try and use a name that is already in use', function(done) {

        var a = jsonfig.setup('a');

        try {
            var b = jsonfig.setup('a');
            throw new Error('Expected error was not thrown!');
        } catch (err) {
            expect(err.message).to.equal('The configuration name [a] is already in use.');
        };
        done();
    });

    it ('should warn if we try and include something that is not defined.', function(done) {
        var warnCallCount = 0;
        jsonfig.setLoggingFunction('warn', function(message) {
            warnCallCount++;
            expect(message).to.equal('The name [oops-doesnt-exist] was not found for inclusion in [missing-test].');
        });
        var myConfig = jsonfig.setup('missing-test')
            .lookInConfig('oops-doesnt-exist');

        expect(warnCallCount).to.equal(1);
        done();
    });

    it ('should warn if a value is not found.', function(done) {
        var warnCallCount = 0;
        jsonfig.setLoggingFunction('warning', function(message) {
            warnCallCount++;
            expect(message).to.equal('Could not find value for key [no-such-value]. (missingValue)');
        });

        var myConfig = jsonfig.setup('missingValue')
            .lookInJson({});

        myConfig.get('no-such-value')
        expect(warnCallCount).to.equal(1);

        done();
    });

    it ('should allow wildcard logging function', function(done) {
        var warnCallCount = 0;

        jsonfig.setLoggingFunction
            ('warn', null)
            ('warning', null)
            ('*', function(message) {
                warnCallCount++;
                expect(message).to.equal('Could not find value for key [no-such-value]. (missingValue2)');
            });

        var myConfig = jsonfig.setup('missingValue2')
            .lookInJson({});

        myConfig.get('no-such-value')
        expect(warnCallCount).to.equal(1);

        done();
    });

    it ('should handle environment without a prefix', function(done) {

        var myConfig = jsonfig.setup('environment-without-prefix')
            .lookInEnvironment();

        done();
    });


    it('should handle the shortening of root files correctly', function(done) {

        var warnCallCount = 0;

        jsonfig.setLoggingFunction
        ('warn', function(message) {
            warnCallCount++;
            if (warnCallCount === 1) {
                expect(message).to.equal('Could not load file - base.config');
            }
        });

        var myConfig = jsonfig.setup('root-file')
            .lookInFile('base.config');

        expect(myConfig.get('anything')).to.equal(null);

        expect(warnCallCount).to.equal(2);
        done();
    });

    it('should warn on ambigous keys', function(done) {
        var warnCallCount = 0;

        jsonfig.setLoggingFunction
        ('warn', function(message) {
            warnCallCount++;
            expect(message).to.equal('The key [AMBIGUOUSKey] matched multiple keys in file - .../testfiles/configFile1.json');
        });

        var myConfig = jsonfig.setup('case-insensitive-keys')
            .lookInFile(path.resolve(__dirname, './testfiles/configFile1.json'));

        expect(myConfig.get('AMBIGUOUSKey').value).to.equal('Myyy');

        expect(warnCallCount).to.equal(1);
        done();
    });

    it('should handle environment without prefix', function(done) {

        process.env['key-without-prefix'] = 'valuableData';

        var config = jsonfig.setup('env-without-prefix')
            .lookInEnvironment();

        expect(config.get('key-without-prefix').value).to.equal('valuableData');
        done();
    });

    it('should get a raw value with getValue()', function(done) {

        jsonfig.setLoggingFunction
            ('warn', null)
            ('warning', null)
            ('*', null);
        var config = jsonfig.setup('raw-value-fetch')
            .lookInJson({'test-key': 'test-value'});

        expect(config.getValue('test-key')).to.equal('test-value');

        expect(config.getValue('non-existant-key')).to.equal(null);
        done();

    });

});



