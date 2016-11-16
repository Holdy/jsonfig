var configValue = require('./configValue');

module.exports = function EnvironmentHandler(optionalPrefix) {

    this.id = 'environment variables ' + (optionalPrefix ? '- prefixed [' + optionalPrefix +']' : '(no prefix)');

    this.get = function(key) {
        var searchKey = key;

        if (optionalPrefix) {
            searchKey = optionalPrefix + '_' + key;
        }

        var value = process.env[searchKey];

        return configValue.makeResult(searchKey, value, this.id);
    }
};
