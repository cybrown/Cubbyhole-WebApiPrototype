var Q = require('q');
var request = require('request');

describe ('Accounts Web Service', function () {

    var conf = require('./conf.json');

    var scheme = conf.scheme;
    var host = conf.host;
    var port = conf.port;
    var path = conf.path;
    var user = conf.user;
    var pass = conf.pass;

    var url = scheme + host + ':' + port + path;

    var req1 = function (options, next) {
        options['auth'] = {
            user: user,
            pass: pass
        };
        request(options, next);
    };

    it ('should return 401 status code without http basic', function (done) {
        request({
            method: 'get',
            url: url + '/accounts'
        }, function (err, response, body) {
            response.statusCode.should.eql(401);
            done();
        });
    });

    it ('should reset data', function (done) {
        request({
            method: 'get',
            url: url + '/system/reset'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should return 401 with an unexisting account', function (done) {
        request({
            method: 'GET',
            url: url + '/accounts',
            auth: {
                user: 'example1',
                pass: 'examplePwd1'
            }
        }, function (err, response, body) {
            response.should.have.status(401);
            done();
        });
    });

    it ('should return 403 with a user level (10) account', function (done) {
        request({
            method: 'GET',
            url: url + '/accounts',
            auth: {
                user: 'user.level10',
                pass: 'pass'
            }
        }, function (err, response, body) {
            response.should.have.status(403);
            done();
        });
    });

    it ('should add an account', function (done) {
        req1({
            method: 'put',
            url: url + '/accounts',
            form: {
                username: 'example1',
                password: 'examplePwd1',
                plan: 1,
                level: 10
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var account = JSON.parse(body);
            account.should.have.property('id', 6);
            account.should.have.property('username', 'example1');
            account.should.have.property('plan', 1);
            account.should.have.property('level', 10);
            done();
        });
    });

    it ('should return 200 with an existing account', function (done) {
        request({
            method: 'GET',
            url: url + '/authping',
            auth: {
                user: 'example1',
                pass: 'examplePwd1'
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should add another account', function (done) {
        req1({
            method: 'put',
            url: url + '/accounts',
            form: {
                username: 'example2',
                password: 'examplePwd2',
                plan: 1,
                level: 1
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 7,
                'username': 'example2',
                'plan': 1,
                'home': 10,
                level: 1
            });
            done();
        });
    });

    it ('should return a list of accounts', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var users = JSON.parse(body);
            users[5].should.eql({
                'id': 6,
                'username': 'example1',
                'plan': 1,
                level: 10,
                home: 9
            });
            users[6].should.eql({
                'id': 7,
                'username': 'example2',
                'plan': 1,
                level: 1,
                home: 10
            });
            done();
        });
    });

    it ('should return an account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/6'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 6,
                'username': 'example1',
                'plan': 1,
                level: 10,
                'home': 9
            });
            done();
        });
    });

    it ('should return current account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/whoami'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'username': 'user',
                'plan': 0,
                level: 100,
                'home': 7
            });
            done();
        });
    });

    it ('should not return current account', function (done) {
        request({
            method: 'get',
            url: url + '/accounts/whoami',
            auth: {
                user: 'not_a',
                pass: 'user'
            }
        }, function (err, response, body) {
            response.statusCode.should.not.equal(404);
            done();
        });
    });

    it ('should not return an account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/42'
        }, function (err, response, body) {
            response.statusCode.should.equal(404);
            done();
        });
    });

    it ('should return an account 2', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/7'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 7,
                'username': 'example2',
                'plan': 1,
                level: 1,
                home: 10
            });
            done();
        });
    });

    it ('should modify an account', function (done) {
        req1({
            method: 'post',
            uri: url + '/accounts/6',
            form: {
                username: 'newExample',
                plan: '3'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 6,
                'username': 'newExample',
                'plan': 3,
                level: 10,
                home: 9
            });
            done();
        });
    });

    it ('should return an account 3', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/6'
        }, function (err, response, body) {
            response.should.have.status(200);
            JSON.parse(body).should.eql({
                'id': 6,
                'username': 'newExample',
                'plan': 3,
                level: 10,
                home: 9
            });
            done();
        });
    });

    it ('should not create an account with existing name', function (done) {
        req1({
            method: 'put',
            url: url + '/accounts',
            form: {
                username: 'example2',
                password: 'examplePwd1',
                plan: 1,
                level: 10
            }
        }, function (err, response, body) {
            response.should.have.status(409);
            done();
        });
    });

    it ('should return accounts bggining by toto of level 10, max 5 results', function (done) {
        Q.all([5, 6, 7, 8, 9].map(function (num) {
            return req1({method: 'put', url: url + '/accounts', form: {username: 'toto' + num, password: 'pwd', level: 10, plan: 1}});
        })).then(function () {
            req1({
                method: 'get',
                url: url + '/accounts/partial/starts-with/' + 'toto'
            }, function (err, response, body) {
                response.should.have.status(200);
                var files = JSON.parse(body);
                files.should.have.length(5);
                files[0].should.have.property('username', 'toto1');
                files[1].should.have.property('username', 'toto_');
                done();
            });
        })
    });

    it ('should return accounts begining by toto_', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/partial/starts-with/' + 'toto_'
        }, function (err, response, body) {
            response.should.have.status(200);
            var files = JSON.parse(body);
            files.should.have.length(1);
            files[0].should.have.property('username', 'toto_');
            files[0].should.not.have.property('home');
            files[0].should.not.have.property('plan');
            files[0].should.not.have.property('level');
            done();
        });
    });

    it ('should return account toto6', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/partial/by-username/toto6'
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            file.should.have.property('username', 'toto6');
            file.should.not.have.property('home');
            file.should.not.have.property('plan');
            file.should.not.have.property('level');
            done();
        });
    });

    it ('should not return an account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/partial/by-username/does_not_exists'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });

    it ('should return a partial account by id', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/partial/by-id/8'
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            file.should.have.property('username', 'toto5');
            file.should.not.have.property('home');
            file.should.not.have.property('plan');
            file.should.not.have.property('level');
            done();
        });
    });
});
