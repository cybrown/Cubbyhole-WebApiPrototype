var Decorate        = require('../src/libs/decorate2');
var CoreDecorators  = require('../src/libs/core_decorators');
var Q               = require('q');
var ApplyObject     = CoreDecorators.ApplyObject;
var Default         = CoreDecorators.Default;
var Convert         = CoreDecorators.Convert;

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
        Decorate(
            function (a, c, b) {
                a.should.eql(1);
                b.should.eql(3);
                c.should.eql(5);
                done();
            })({
            a: 1,
            b: {then: function (f) {f(3);}},
            c: 5
        });
    });
});

describe ('Core Decorators', function () {

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
                    return {
                        then: function (ok, fail) {
                            setTimeout(function () {
                                if (error) {
                                    fail(error);
                                } else {
                                    ok(res);
                                }
                            }, 10);
                        }
                    };
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
                done();
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
    });
});
