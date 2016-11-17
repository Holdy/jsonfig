var EnvironmentHandler = require('./lib/environmentHandler');
var JsonHandler        = require('./lib/jsonHandler');
var FileHandler        = require('./lib/fileHandler');

var configValue = require('./lib/configValue');
var outputLib   = require('./lib/outputLib');

var nameRegistry = {};

function setup(name) {
    if (nameRegistry[name]) {
        throw new Error('The configuration name [' + name + '] is already in use.');
    }

    var item = new ConfigChainItem(null, name);
    nameRegistry[name] = item;
    return item;
}

function copyHandlers(source, destination, chainName) {

    var current = source;
    while (current!= null) {
        destination.addHandler(current.handler, chainName);
        current = current.next;
    }
}

function performGet(currentChainItem, key) {
    if (currentChainItem.handler !== null) {
        var result = currentChainItem.handler.get(key);
        if (result) {
            result.configName = currentChainItem.configName;
            return result;
        }
    }

    // At this point, either we're the root or the current handler had nothing.
    return currentChainItem.next ? performGet(currentChainItem.next, key) : null;
}

function isSensitive(wrappedValue) {
    var cleanKey = wrappedValue.key.toLowerCase();
    return cleanKey.indexOf('password') != -1
        || cleanKey.indexOf('pword')    != -1
        || cleanKey.indexOf('secret')   != -1;
}

function ConfigChainItem (handler, configName) {
    this.handler = handler;
    this.next = null;
    this.configName = configName;

    this.getValue = function (key, defaultValue) {
        var result = this.get(key, defaultValue);
        return result ? result.value : null;
    }

    this.get = function(key, defaultValue) {
        var result = performGet(this, key);

        if (!result && configValue.hasValue(defaultValue)) {
            result = configValue.makeResult(key, defaultValue, 'default provided by code');
            result.configName = configName;
        }

        if (result == null) {
            outputLib.warn('Could not find value for key [' + key + ']. (' + configName + ')');
        } else {
            var displayValue = isSensitive(result) ? '**********' : result.value;
            var message = 'Using [' + result.key + ']=[' + displayValue + '] from ' + result.sourceName + ' (' + result.configName + ')';
            outputLib.info(message);
        }

        return result;
    };

    this.endOfChain = function() {
        return this.next ? this.next.endOfChain() : this;
    };

    this.addHandler = function(handler, configName) {
        this.endOfChain().next = new ConfigChainItem(handler, configName);
        return this;
    };

    this.lookInConfig = function(existingConfigName) {
        var namedChain = nameRegistry[existingConfigName];
        if (!namedChain) {
            outputLib.warn('The name [' + existingConfigName + '] was not found for inclusion in [' + configName + '].');
        } else {
            copyHandlers(namedChain.next, this, configName + '/' + existingConfigName);
        }
        return this;
    };

    this.lookInEnvironment = function(optionalPrefix) {
        return this.addHandler(new EnvironmentHandler(optionalPrefix), configName)
    };

    this.lookInFile = function(filePath) {
        return this.addHandler(new FileHandler(filePath), configName);
    };

    this.lookInJson = function (jsonObject) {
        return this.addHandler(new JsonHandler(jsonObject), configName);
    }
}

module.exports.setup = setup;
module.exports.setLoggingFunction = outputLib.setLoggingFunction;
