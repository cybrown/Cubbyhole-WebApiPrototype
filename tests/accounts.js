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
            url: url + '/files'
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

    it ('should add an account', function (done) {
        req1({
            method: 'put',
            url: url + '/accounts',
            form: {
                username: 'example1',
                password: 'examplePwd1',
                plan: 1
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'username': 'example1',
                'password': 'examplePwd1',
                'plan': 1
            });
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
                plan: 1
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 2,
                'username': 'example2',
                'password': 'examplePwd2',
                'plan': 1
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
            JSON.parse(body).should.eql([
                {
                    'id': 1,
                    'username': 'example1',
                    'password': 'examplePwd1',
                    'plan': 1
                },
                {
                    'id': 2,
                    'username': 'example2',
                    'password': 'examplePwd2',
                    'plan': 1
                }
            ]);
            done();
        });
    });

    it ('should return an account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/1'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'username': 'example1',
                'password': 'examplePwd1',
                'plan': 1
            });
            done();
        });
    });

    it ('should return an account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/2'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 2,
                'username': 'example2',
                'password': 'examplePwd2',
                'plan': 1
            });
            done();
        });
    });

    it ('should modify an account', function (done) {
        req1({
            method: 'post',
            uri: url + '/accounts/1',
            form: {
                username: 'newExample',
                plan: '3'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'username': 'newExample',
                'password': 'examplePwd1',
                'plan': 3
            });
            done();
        });
    });

    it ('should return an account', function (done) {
        req1({
            method: 'get',
            url: url + '/accounts/1'
        }, function (err, response, body) {
            response.should.have.status(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'username': 'newExample',
                'password': 'examplePwd1',
                'plan': 3
            });
            done();
        });
    });
});
