'use strict';

var Q = require('q');

var ExpressRequest = function (args) {
    return function (req, res) {
        if (!args) {
            args = this.argNames;
        }
        var result = {};
        args.forEach(function (fullKey) {
            var obj, key, doThrow = true;
            if (fullKey[0] === '?') {
                doThrow = false;
                fullKey = fullKey.substring(1);
            }
            if (fullKey.indexOf('.') !== -1) {
                var tmp = fullKey.split('.');
                obj = tmp[0];
                key = tmp[1];
            } else {
                key = fullKey;
                if (req.params.hasOwnProperty(key)) {
                    obj = 'params';
                } else if (req.method != 'GET' && req.method != 'HEAD' && req.body.hasOwnProperty(key)) {
                    obj = 'body';
                } else {
                    obj = 'query';
                }
            }
            if (doThrow && !req[obj].hasOwnProperty(key)) {
                throw new Error("Missing key: " + key);
            }
            result[key] = req[obj][key];
        });
        var onErr = function (err) {
            var status = err.status ? err.status : 500;
            console.trace(err);
            res.status(status).send(err);
        };
        try {
            Q.when(this.call(null, result), function (toSend) {
                if (res && res.send) {
                    res.send(toSend);
                }
            }, onErr);
        } catch (err) {
            onErr(err);
        }
    };
};

var Default = function (map, value) {
    if (value !== undefined) {
        var key = map;
        map = {};
        map[key] = value;
    }
    return function (kwargs) {
        Object.keys(map).forEach(function(key) {
            if (!kwargs.hasOwnProperty(key) || kwargs[key] === undefined) {
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

        var _this = this;
        var _arguments = arguments;
        return Q.all(Object.keys(map).map(function (key) {
            return Q(map[key](kwargs[key])).then(function (value) {
                kwargs[key] = value;
            }).catch (function (err) {
                err.status = 404;
                throw err;
            });
        })).then(function () {
            return _this.apply(null, _arguments);
        });


        /*
        Object.keys(map).forEach(function (key) {
            map[key](kwargs[key]).then(function (value) {
                kwargs[key] = value;
            });

            try {
                kwargs[key] = map[key](kwargs[key]);
            } catch (err) {
                err.status = 404;
                throw err;
            }
        });
        return this.apply(null, arguments);
        */
    };
};

var Ensure = function (map, func) {
    if (func) {
        var key = map;
        map = {};
        map[key] = func;
    }
    return function (kwargs) {
        Object.keys(map).forEach(function (key) {
            try {
                switch (map[key]) {
                    case 'boolean':
                        if (typeof kwargs[key] !== 'boolean') {
                            kwargs[key] = Boolean(JSON.parse(kwargs[key]));
                        }
                        break;
                    case 'number':
                        kwargs[key] = Number(kwargs[key]);
                        break;
                    default:
                        var err = new Error();
                        err.status = 500;
                        break;
                }
            } catch (err) {
                err.status = err.status || 400;
                throw err;
            }
        });
        return this.apply(null, arguments);
    };
};

module.exports = {
    Default: Default,
    Convert: Convert,
    ExpressRequest: ExpressRequest,
    Ensure: Ensure
};
