
var loggingNameMap = {
    'information': 'info',
    'warning': 'warn'
};
var loggingFunctions = {};

var loggingReturn = null;

function setLoggingFunction(name, functionPointer) {
    var cleanName = name.toLowerCase();
    var mappedName = loggingNameMap[cleanName];
    loggingFunctions[mappedName ? mappedName : cleanName] = functionPointer;
    return loggingReturn;
}

loggingReturn = setLoggingFunction;

function getLoggingFunction(name) {
    var result = loggingFunctions[name];
    if (!result) {
        result = loggingFunctions['*'];
    }
    return result;
}

function processMessage(message, level) {
    var givenFunction = getLoggingFunction(level);
    if (givenFunction) {
        givenFunction(message);
    }
}

function warn(message) {
    processMessage(message, 'warn');
}

function info(message) {
    processMessage(message, 'info');
}

module.exports.setLoggingFunction = setLoggingFunction;
module.exports.warn = warn;
module.exports.info = info;

