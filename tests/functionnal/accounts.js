var should = require('should');
var request = require('request');

describe ('Accounts Web Service', function () {

    var scheme = 'http://';
    var host = 'localhost';
    var port = 3000;
    var user = 'user';
    var pass = 'pass';

    var url = scheme + host + ':' + port;

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
        req1({
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
            account.should.have.property('id', 4);
            account.should.have.property('username', 'example1');
            account.should.have.property('password', 'examplePwd1');
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
                'id': 5,
                'username': 'example2',
                'password': 'examplePwd2',
                'plan': 1,
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
            users[4] = {
                'id': 4,
                'username': 'example1',
                'password': 'examplePwd1',
                'plan': 1,
                level: 1
            };
            users[5] = {
                'id': 5,
                'username': 'example2',
                'password': 'examplePwd2',
                'plan': 1,
                level: 1
            };
            done();
        });
    });

    it ('should return an account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/4'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'username': 'example1',
                'password': 'examplePwd1',
                'plan': 1,
                level: 10
            });
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
            url: url + '/accounts/5'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 5,
                'username': 'example2',
                'password': 'examplePwd2',
                'plan': 1,
                level: 1
            });
            done();
        });
    });

    it ('should modify an account', function (done) {
        req1({
            method: 'post',
            uri: url + '/accounts/4',
            form: {
                username: 'newExample',
                plan: '3'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'username': 'newExample',
                'password': 'examplePwd1',
                'plan': 3,
                level: 10
            });
            done();
        });
    });

    it ('should return an account 3', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/4'
        }, function (err, response, body) {
            response.should.have.status(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'username': 'newExample',
                'password': 'examplePwd1',
                'plan': 3,
                level: 10
            });
            done();
        });
    });
});
