'use strict';

var Q = require('q');
var HttpResponse = require('./HttpResponse');

var ExpressRequest = function (args) {
    return function (req, res) {
        if (!args) {
            args = this.argNames;
        }
        var kwargs = {
            $req: req,
            $res: res
        };
        args.forEach(function (fullKey) {
            var obj, key, doThrow = true;
            if (fullKey[0] === '$') {
                return;
            }
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
                var error = new Error("Missing key: " + key);
                error.status = 400;
                throw error;
            }
            kwargs[key] = req[obj][key];
        });
        var onErr = function (err) {
            var status = err.status ? err.status : 500;
            console.trace(err);
            res.status(status).send();
        };
        try {
            Q.when(this.call(this, kwargs), function (toSend) {
                if (res && res.send) {
                    if (toSend instanceof HttpResponse) {
                        res.status(toSend.status);
                        res.set(toSend.headers);
                        toSend = toSend.body;
                    }
                    if (toSend && (typeof toSend.pipe === 'function')) {
                        toSend.pipe(res);
                    } else {
                        res.send(toSend);
                    }
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

var MinLevel = function (minLevel) {
    return function (kwargs) {
        if (!kwargs.$req.user) {
            var err = new Error('Account must be authenticated');
            err.status = 401;
            throw err;
        }
        if (kwargs.$req.user.level < minLevel) {
            var err = new Error('Account must be authorized');
            err.status = 403;
            throw err;
        }
        return this.apply(null, arguments);
    };
};

module.exports = {
    Default: Default,
    Convert: Convert,
    ExpressRequest: ExpressRequest,
    Ensure: Ensure,
    MinLevel: MinLevel
};
