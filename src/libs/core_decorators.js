'use strict';

var resolve = function (value, next) {
    return value.then ? value.then(next) : next(value);
};

var Default = function (map, value) {
    if (value) {
        var key = map;
        map = {};
        map[key] = value;
    }
    return function (kwargs) {
        Object.keys(map).forEach(function(key) {
            if (!kwargs.hasOwnProperty(key)) {
                kwargs[key] = map[key];
            }
        });
        return this.apply(null, arguments);
    };
};

var Convert = function (map, func) {
    if (func) {
        var key = map;
        map = {};
        map[key] = func;
    }
    return function (kwargs) {
        Object.keys(map).forEach(function (key) {
            kwargs[key] = map[key](kwargs[key]);
        });
        return this.apply(null, arguments);
    };
};

module.exports = {
    Default: Default,
    Convert: Convert
};
