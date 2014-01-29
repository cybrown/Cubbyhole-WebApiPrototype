'use strict';

var sendNotFound = function (res, message) {
    res.status(404).send(message);
};

var sendServerError = function (res, message) {
    res.status(500).send(message);
};

var sendInvalidRequest = function (res, message) {
    res.status(400).send(message);
};

var Converter = function (name, convertor) {
    return function (req, res) {
        var _this = this;
        var argsForThis = arguments;
        var data = name.split('.');
        var id = req[data[0]][data[1]];
        var obj = convertor(id);
        if (!obj) {
            sendNotFound(res, req[data[0]][data[1]]);
        } else if (typeof obj === 'function') {
            obj(function (err, obj) {
                if (err) {
                    sendServerError(res, req[data[0]][data[1]]);
                } else {
                    if (!obj) {
                        sendNotFound(res, req[data[0]][data[1]]);
                    } else {
                        req[data[0]][data[1]] = obj;
                        _this.apply(null, argsForThis);
                    }
                }
            })
        } else if (obj.then) {
            obj.then(function (result) {
                if (!result) {
                    sendNotFound(res, req[data[0]][data[1]]);
                } else {
                    req[data[0]][data[1]] = result;
                    _this.apply(null, argsForThis);
                }
            }, function (err) {
                sendServerError(res, req[data[0]][data[1]]);
            });
        } else {
            req[data[0]][data[1]] = obj;
            _this.apply(null, argsForThis);
        }
    };
};

var Inject = function () {
    var orgArgs = arguments;
    return function (req, res) {
        var args = [];
        for (var i = 0, max = orgArgs.length; i < max; i++) {
            var data = orgArgs[i].split('.');
            args.push(req[data[0]][data[1]]);
        }
        res.send(this.apply(null, args));
    }
};

var ParamValid = function (name, regex) {
    return function (req, res) {
        if (!req.params[name].match(regex)) {
            sendInvalidRequest(res, 'Error with req.params.' + name);
            return;
        }
        this.apply(null, arguments);
    };
};

var BodyValid = function (name, regex) {
    return function (req, res) {
        if (!req.body[name].match(regex)) {
            sendInvalidRequest(res, 'Error with req.body.' + name);
            return;
        }
        this.apply(null, arguments);
    };
};

var QueryValid = function (name, regex) {
    return function (req, res) {
        if (!req.query[name].match(regex)) {
            sendInvalidRequest(res, 'Error with req.query.' + name);
            return;
        }
        this.apply(null, arguments);
    };
};

var getArgNames = function (func) {
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    return func.toString().replace(STRIP_COMMENTS, '').match(FN_ARGS)[1].split(FN_ARG_SPLIT).map(function (str) {return str.trim();});
};

var AutoInject = function () {
    return function (req, res) {
        var args = [];
        var names = getArgNames(this);
        for (var i = 0, max = names.length; i < max; i++) {
            if (req.params.hasOwnProperty(names[i])) {
                args.push(req.params[names[i]]);
            } else if (req.method !== 'HEAD' && req.method !== 'GET' && req.body.hasOwnProperty(names[i])) {
                args.push(req.body[names[i]]);
            } else if (req.query.hasOwnProperty(names[i])) {
                args.push(req.query[names[i]]);
            } else {
                sendServerError(res, 'Parameter not found: <' + names[i] + '>');
                return;
            }
        }
        try {
            res.send(this.apply(null, args));
        } catch (e) {
            sendServerError('error');
        }
    }
};

var Default = function (source, name, value) {
    return function (req, res) {
        if (!req[source]) {
            res[source] = {};
        }
        if (!req[source].hasOwnProperty(name)) {
            req[source][name] = value;
        }
        this.apply(null, arguments);
    };
};

module.exports = {
    Converter: Converter,
    Inject: Inject,
    ParamValid: ParamValid,
    BodyValid: BodyValid,
    QueryValid: QueryValid,
    AutoInject: AutoInject,
    Default: Default
};
