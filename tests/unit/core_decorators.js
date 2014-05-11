var Decorate        = require('../../src/libs/decorate');
var CoreDecorators  = require('../../src/libs/core_decorators');
var Q               = require('q');
var Default         = CoreDecorators.Default;
var Convert         = CoreDecorators.Convert;
var Ensure          = CoreDecorators.Ensure;
var ExpressRequest  = CoreDecorators.ExpressRequest;
var MinLevel        = CoreDecorators.MinLevel;

describe ('Decorate', function () {

    it ('should apply an object', function (done) {
        Decorate(
            function (a, c, b) {
                a.should.eql(1);
                b.should.eql(3);
                c.should.eql(5);
                done();
            })({
            a: 1,
            b: 3,
            c: 5
        });
    });

    it ('should process promises', function (done) {
        var defer = Q.defer();
        setTimeout(function () {
            defer.resolve(3);
        }, 10);
        Decorate(
            function (a, c, b) {
                a.should.eql(1);
                b.should.eql(3);
                c.should.eql(5);
                done();
            })({
            a: 1,
            b: defer.promise,
            c: 5
        });
    });
});

describe ('Core Decorators', function () {

    describe ('Ensure', function () {
    
        it ('should cast a boolean', function (done) {
            Decorate(
                Ensure('b', 'boolean'),
                function (b) {
                    b.should.be.type('boolean');
                    done();
                })({b: 0});
        });
        
        it ('should throw an error if boolean is not correct', function () {
            (function () {
                Decorate(
                    Ensure('b', 'boolean'),
                    function (b) {
                        b.should.be.type('boolean');
                        done();
                    })({b: 'not_a_boolean'});
            }).should.throw();
        });
    });
    
    describe ('Default', function () {

        it ('should set a default value to an object', function (done) {
            Decorate(
                Default('d', 'default'),
                function (a, c, d) {
                    a.should.eql('A');
                    c.should.eql('C');
                    d.should.eql('default');
                    done();
                })({a: 'A', c: 'C'});
        });

        it ('should set a default value to an object with a map', function (done) {
            Decorate(
                Default({d: 'default', f: 'foo'}),
                function (a, c, d) {
                    a.should.eql('A');
                    c.should.eql('C');
                    d.should.eql('default');
                    done();
                })({a: 'A', c: 'C'});
        });

        it ('should return asynchronous exceptions', function (done) {
            var MakePromise = function () {
                return function () {
                    var _this = this, _arguments = arguments;
                    var error = null;
                    try {
                        var res = _this.apply(null, _arguments);
                    } catch (e) {
                        error = e;
                    }
                    var defer = Q.defer();
                    setTimeout(function () {
                        if (error) {
                            defer.reject();
                        } else {
                            defer.resolve();
                        }
                    }, 10);
                    return defer.promise;
                };
            };

            var res = Decorate(
                MakePromise(),
                Default({d: 'default', f: 'foo'}),
                function (a, c, d) {
                    a.should.eql('A');
                    c.should.eql('C');
                    d.should.eql('default');
                    throw new Error();
                })({a: 'A', c: 'C'});
            res.then(function () {
                throw new Error('Should not be executed');
            }, function () {
                done();
            });
        });
    });

    describe ('Convert', function () {

        it ('should convert a value', function (done) {
            Decorate(
            Convert('num', Number),
            function (num) {
                num.should.be.type('number');
                num.should.eql(42);
                done();
            })({num: '42'});
        });
        
        it ('should accept a map', function (done) {
            Decorate(
            Convert({num: Number, bool: Boolean}),
            function (num, bool) {
                num.should.be.type('number');
                num.should.eql(42);
                bool.should.be.type('boolean');
                bool.should.eql(true);
                done();
            })({num: '42', bool: 1});
        });

        it ('should convert a value with a promise', function (done) {
            var asyncNumber = function (str) {
                var defer = Q.defer();
                setTimeout(function () {
                    defer.resolve(Number(str));
                });
                return defer.promise;
            };
            var returnedValue = Decorate(
            Convert('num', asyncNumber),
            function (num) {
                num.should.be.type('number');
                num.should.eql(42);
                return 'Value to check that return value is returned';
            })({num: '42'})
            returnedValue.then(function (res) {
                res.should.eql('Value to check that return value is returned');
                done();
            });
        });

        it ('should propagate errors', function () {
            (function () {
                Decorate(
                    Convert({num: Number, bool: function (){throw new Error();}}),
                    function (num, bool) {
                        num.should.be.type('number');
                        num.should.eql(42);
                        bool.should.be.type('boolean');
                        bool.should.eql(true);
                    })({num: '42', bool: 1});
            }).should.throw();
        });

        it ('should propagate errors through promises', function (done) {
            var asyncNumber = function (str) {
                var defer = Q.defer();
                setTimeout(function () {
                    defer.reject(new Error());
                });
                return defer.promise;
            };
            var returnedValue = Decorate(
                Convert('num', asyncNumber),
                function (num) {
                    num.should.be.type('number');
                    num.should.eql(42);
                    return 'Value to check that return value is returned';
                })({num: '42'})
            returnedValue.then(function (res) {
                throw new Error('should not be executed');
            }, function () {
                done();
            });
        });

        it ('should throw a 404 error if the conversion function returns undefined', function (done) {
            Decorate(
                Convert('num', function () {
                    return Q.promise(function (resolve) {
                        throw new Error('not found');
                    });
                }),
                function (num) {
                    throw new Error('should not be executed');
                })({num: '42'}, {status: function (value) {
                    value.should.eql(404);
                }
            }).then(function (value) {
                throw new Error('should not be called');
            }).catch(function (err) {
                err.status.should.eql(404);
                done();
            });
        });
    });

    describe ('MinLevel', function () {

        it ('should pass if account is defined and level is sufficient', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                MinLevel(2),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                    done();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'},
                account: {
                    level: 3
                }
            });
        });

        it ('should throw if account is not defined', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                MinLevel(2),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            }, {
                status: function (statusCode) {
                    return {
                        send: function (err) {
                            statusCode.should.eql(401);
                            err.status.should.eql(401);
                            done();
                        }
                    }
                }
            });
        });

        it ('should throw if level is not sufficient', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                MinLevel(2),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'},
                account: {
                    level: 1
                }
            }, {
                status: function (statusCode) {
                    return {
                        send: function (err) {
                            statusCode.should.eql(401);
                            err.status.should.eql(401);
                            done();
                        }
                    }
                }
            });
        });
    });

    describe ('Request', function () {

        it ('should get the parameters', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                    done();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            });
        });

        it ('should get the parameters from function decompilation', function (done) {
            Decorate(
                ExpressRequest(),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                    done();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            });
        });

        it ('should not get values from body if request is get', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('b');
                    c.should.eql('c');
                    done();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'},
                method: 'GET'
            });
        });

        it ('should not get values from body if request is head', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('b');
                    c.should.eql('c');
                    done();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'},
                method: 'HEAD'
            });
        });

        it ('should use the dot syntax', function (done) {
            Decorate(
                ExpressRequest(['query.a', 'b', 'c']),
                function (a, b, c) {
                    a.should.eql('a');
                    b.should.eql('2');
                    c.should.eql('c');
                    done();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            });
        });

        it ('should throw an error if parameter is not found', function () {
            (function () {
                Decorate(
                    ExpressRequest(['a', 'b', 'c', 'd']),
                    function (a, b, c, d) {
                        a.should.eql('A');
                        b.should.eql('2');
                        c.should.eql('c');
                    }
                )({
                    params: {a: 'A'},
                    query: {a: 'a', b: 'b', c: 'c'},
                    body: {a: '1', b: '2'}
                });
            }).should.throw();
        });

        it ('should throw an error if parameter is not found 2', function () {
            (function () {
                Decorate(
                    ExpressRequest(['body.a', 'b', 'c']),
                    function (a, b, c, d) {}
                )({
                    params: {a: 'A'},
                    query: {a: 'a', b: 'b', c: 'c'},
                    body: {b: '2'}
                });
            }).should.throw();
        });

        it ('should not throw an error if a parameter is missing with the ? syntax', function () {
            Decorate(
                ExpressRequest(['a', 'b', 'c', '?d']),
                function (a, b, c, d) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                    (d === undefined).should.be.ok;
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            });
        });

        it ('should ignore a parameter begining by $ with function decompilation', function () {
            Decorate(
                ExpressRequest(),
                function (a, b, c, $d) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                    ($d === undefined).should.be.ok;
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            });
        });

        it ('should not throw an error if a parameter is missing with the ? syntax 2', function (done) {
            Decorate(
                ExpressRequest(['?body.a', 'b', 'c']),
                function (a, b, c) {
                    b.should.eql('2');
                    c.should.eql('c');
                    (a === undefined).should.be.ok;
                    done();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {b: '2'}
            });
        });

        it ('should throw an error if a parameter is missing after an optional parameter', function () {
            (function () {
                Decorate(
                    ExpressRequest(['a', '?b', 'c']),
                    function (a, b, c) {
                        b.should.eql('2');
                        c.should.eql('c');
                        (a === undefined).should.be.ok;
                    }
                )({
                    params: {a: 'A'},
                    query: {a: 'a', b: 'b'},
                    body: {b: '2'}
                });
            }).should.throw();
        });

        it ('should send the function return value to res.send', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                    return 'toto';
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            }, {
                send: function (data) {
                    data.should.eql('toto');
                    done();
                }
            });
        });

        it ('should send the function return value to res.send with a promise', function (done) {
            Decorate(
                ExpressRequest(['a', 'b', 'c']),
                function (a, b, c) {
                    a.should.eql('A');
                    b.should.eql('2');
                    c.should.eql('c');
                    var defer = Q.defer();
                    setTimeout(function () {
                        defer.resolve('toto');
                    }, 10);
                    return defer.promise;
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            }, {
                send: function (data) {
                    data.should.eql('toto');
                    done();
                }
            });
        });

        it ('should set a status code if an exception is thrown', function (done) {
            Decorate(
                ExpressRequest(['a']),
                function (a) {
                    throw new Error();
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            }, {
                _status: 200,
                status: function (value) {
                    this._status = value;
                    return this;
                },
                send: function (data) {
                    this._status.should.eql(500);
                    done();
                }
            });
        });

        it ('should set the status code if an exception has a status property', function (done) {
            Decorate(
                ExpressRequest(['a']),
                function (a) {
                    var err = new Error();
                    err.status = 400;
                    throw err;
                }
            )({
                params: {a: 'A'},
                query: {a: 'a', b: 'b', c: 'c'},
                body: {a: '1', b: '2'}
            }, {
                _status: 200,
                status: function (value) {
                    this._status = value;
                    return this;
                },
                send: function (data) {
                    this._status.should.eql(400);
                    done();
                }
            });
        });
    });
});
