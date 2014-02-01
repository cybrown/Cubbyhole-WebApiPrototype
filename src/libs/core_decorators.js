'use strict';

var resolve = function (value, next) {
    return value.then ? value.then(next) : next(value);
};

// Obsolete, integrated in Decorate
var ApplyObject = function () {
    return function (object) {
        var names = getArgNames(this);
        var args = [];
        for (var i = 0, max = names.length; i < max; i++) {
            args.push(object[names[i]]);
        }
        return this.apply(null, args);
    };
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
        this.apply(null, arguments);
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
    ApplyObject: ApplyObject,
    Default: Default,
    Convert: Convert
};
