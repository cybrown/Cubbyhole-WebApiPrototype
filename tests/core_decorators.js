describe ('Core Decorators', function () {

    var Decorate       = require('../src/libs/decorate2');
    var CoreDecorators = require('../src/libs/core_decorators');
    var ApplyObject    = CoreDecorators.ApplyObject;
    var Default        = CoreDecorators.Default;
    var Convert        = CoreDecorators.Convert;

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
                return {
                    then: function (onFulfilled, onRejected) {
                        typeof onFulfilled !== 'function' && (onFulfilled = function () {});
                        typeof onRejected !== 'function' && (onRejected = function () {});
                        onFulfilled(Number(str));
                    }
                };
            };
            Decorate(
            Convert('num', asyncNumber),
            function (num) {
                num.should.be.type('number');
                num.should.eql(42);
                done();
            })({num: '42'});
        });
    });
});
