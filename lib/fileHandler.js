var path = require('path');

var configValue = require('./configValue');
var outputLib = require('./outputLib');

module.exports = function FileHandler(fileName) {
    this.id = 'file - ' + shortenFilename(fileName);

    try {
        this.data = require(fileName);

        this.get = function(key) {
            var value = findObjectValue(this.data, key, this.id);
            return configValue.makeResult(key, value, this.id);
        }
    } catch (err) {
        outputLib.warn('Could not load ' + this.id);
        this.get = function() {
            return null;
        };
    }
};

function shortenFilename(fileName) {
    var parts = fileName.split(path.sep);
    if(parts.length > 0 && parts[0] === '') {
        parts.splice(0, 1)
    }
    var result = fileName;
    if (parts.length > 1) {
        var lastIndex = parts.length - 1;
        result = '...' + path.sep + parts[lastIndex-1] + path.sep + parts[lastIndex];
    }

    return result;
}

function findObjectValue(dataObject, key, shortFileName) {
    var cleanKey = key.toLowerCase();
    var value = null;
    var matches = 0;

    Object.keys(dataObject).forEach(function(presentKey) {
        if (presentKey.toLowerCase() === cleanKey) {
            value = dataObject[presentKey];
            matches++;
        }
    });

    if (matches > 1) {
        outputLib.warn('The key [' + key + '] matched multiple keys in ' + shortFileName);
    }
    return value;
}
