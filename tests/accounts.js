var should = require('should');
var request = require('request');

describe ('accounts Web Service', function () {

    it ('should reset data', function (done) {
        request.get('http://localhost:3000/system/reset', function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should add an account', function (done) {
        request.put({
            url: 'http://localhost:3000/accounts',
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
        request.put({
            url: 'http://localhost:3000/accounts',
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

    it ('Should return a list of accounts', function (done) {
        request.get('http://localhost:3000/accounts', function (err, response, body) {
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

    it ('Should return an account', function (done) {
        request.get('http://localhost:3000/accounts/1', function (err, response, body) {
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

    it ('Should return an account', function (done) {
        request.get('http://localhost:3000/accounts/2', function (err, response, body) {
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

    it ('Should modify an account', function (done) {
        request.post({
            uri: 'http://localhost:3000/accounts/1',
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

    it ('Should return an account', function (done) {
        request.get('http://localhost:3000/accounts/1', function (err, response, body) {
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
