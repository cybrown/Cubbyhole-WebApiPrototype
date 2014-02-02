'use strict';

var Q = require('q');

var getArgNames = function (func) {
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var matches = func.toString().replace(STRIP_COMMENTS, '').match(FN_ARGS)[1];
    return matches === '' ? [] : matches.split(FN_ARG_SPLIT).map(function (str) {return str.trim();});
};

var processPromises = function (kwargs, cb) {
    var count = 0;
    var cur = 0;
    var defer = Q.defer();
    Object.keys(kwargs).forEach(function (key) {
        if (kwargs[key] && kwargs[key].then) {
            count++;
            kwargs[key].then(function(res) {
                kwargs[key] = res;
                cur++;
                if (count === cur) {
                    try {
                        defer.resolve(cb());
                    } catch (e) {
                        defer.reject(e);
                    }
                }
            }, function (e) {
                cur++;
                defer.reject(e);
            });
        }
    });
    if (count === 0) {
        return cb();
    } else {
        return defer.promise;
    }
};

var DecorateOne = function (decorator) {
    var decorators = arguments;
    return function (next) {
        return function () {
            return decorator.apply(next, arguments);
        };
    };
};

var Decorate = function () {
    var decorators = arguments;
    var next = arguments[arguments.length - 1];
    arguments.length--;
    var argNames = getArgNames(next);
    var prev = function (kwargs) {
        var result = processPromises(kwargs, function () {
            var args = [];
            for (var i = 0, max = argNames.length; i < max; i++) {
                args.push(kwargs[argNames[i]]);
            }
            return next.apply(null, args)
        });
        return result;
    };
    prev.argNames = argNames;
    for (var key = decorators.length - 1; key >= 0; key--) {
        prev = (function (p, key) {
            return function () {
                return decorators[key].apply(p, arguments);
            };
        })(prev, key);
        prev.argNames = argNames;
    }
    return prev;
};

module.exports = Decorate;
