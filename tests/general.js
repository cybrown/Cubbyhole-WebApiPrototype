var request = require('request');

describe ('General app tests', function () {

    var scheme = 'http://';
    var host = 'localhost';
    var port = 3000;
    var user = 'user';
    var pass = 'pass';

    var url = scheme + host + ':' + port;

    it ('should respond to ping', function (done) {
        request({
            method: 'get',
            url: url + '/ping'
        }, function (err, response, body) {
            response.statusCode.should.eql(200);
            body.should.eql('pong');
            done();
        });
    });

    it ('should not respond to authping without auth', function (done) {
        request({
            method: 'get',
            url: url + '/authping'
        }, function (err, response, body) {
            response.statusCode.should.eql(401);
            done();
        });
    });

    it ('should respond to authping with auth', function (done) {
        request({
            method: 'get',
            url: url + '/authping',
            auth: {
                user: user,
                pass: pass
            }
        }, function (err, response, body) {
            response.statusCode.should.eql(200);
            body.should.eql('pong');
            done();
        });
    });
});