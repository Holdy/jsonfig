function makeResult (key, value, sourceName) {
    var result = null;

    if (hasValue(value)) {
        result = new ConfigValue(key, value, sourceName);
    }

    return result;
}

function hasValue(value) {
    return value || value === '' || value === false || value === 0;
}

function ConfigValue (key, value, sourceName) {
    this.key = key;
    this.value = value;
    this.sourceName = sourceName;
}

module.exports.makeResult = makeResult;
module.exports.hasValue = hasValue;
