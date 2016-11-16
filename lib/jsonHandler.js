var configValue = require('./configValue');


module.exports = function JsonHandler(jsonBlob) {

    this.id = 'JSON object';

    this.get = function(key) {
        var value = jsonBlob[key];
        return configValue.makeResult(key, value, this.id);
    };

};
