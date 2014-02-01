'use strict';

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
    Object.keys(kwargs).forEach(function (key) {
        if (kwargs[key] && kwargs[key].then) {
            count++;
            kwargs[key].then(function(res) {
                kwargs[key] = res;
                cur++;
                if (count === cur) {
                    cb();
                }
            });
        }
    });
    if (count === 0) {
        cb();
    }
};

var DecorateOne = function (decorator) {
    var decorators = arguments;
    return function (next) {
        return function () {
            decorator.apply(next, arguments);
        };
    };
};

var Decorate = function () {
    var decorators = arguments;
    var next = arguments[arguments.length - 1];
    arguments.length--;
    var prev = function (kwargs) {
        processPromises(kwargs, function () {
            var names = getArgNames(next);
            var args = [];
            for (var i = 0, max = names.length; i < max; i++) {
                args.push(kwargs[names[i]]);
            }
            return next.apply(null, args)
        });
        return 'PROMISE';
    };
    for (var key = decorators.length - 1; key >= 0; key--) {
        prev = (function (p, key) {
            return function () {
                decorators[key].apply(p, arguments);
            };
        })(prev, key)
    }
    return prev;
};

module.exports = Decorate;
