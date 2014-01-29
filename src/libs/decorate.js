'use strict';

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
    return function (next) {
        var prev = next;
        for (var key = decorators.length - 1; key >= 0; key--) {
            prev = (function (p, key) {
                return function () {
                    decorators[key].apply(p, arguments);
                };
            })(prev, key)
        }
        return prev;
    };
};

module.exports = Decorate;
