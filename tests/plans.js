var should = require('should');
var request = require('request');

describe ('Plan Web Service', function () {

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

    it ('should add a plan', function (done) {
        req1({
            method: 'put',
            url: url + '/plans',
            form: {
                name: 'first plan',
                price: 10,
                bandwidthDownload: 100,
                bandwidthUpload: 100,
                space: 30,
                shareQuota: 30
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);

            JSON.parse(body).should.eql({
                'id': 4,
                'name': 'first plan',
                'price': 10,
                'bandwidthDownload': 100,
                'bandwidthUpload': 100,
                'space': 30,
                'shareQuota': 30
            });

            done();
        });
    });

    it ('should add another plan', function (done) {
        req1({
            method: 'put',
            url: url + '/plans',
            form: {
                name: 'second plan',
                price: 100,
                bandwidthDownload: 1000,
                bandwidthUpload: 1000,
                space: 300,
                shareQuota: 300
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);

            JSON.parse(body).should.eql({
                'id': 5,
                'name': 'second plan',
                'price': 100,
                'bandwidthDownload': 1000,
                'bandwidthUpload': 1000,
                'space': 300,
                'shareQuota': 300
            });

            done();
        });
    });


    it ('should get all plans', function (done) {
        req1({
            method: 'get',
            url: url + '/plans'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should delete a plan', function (done) {
        throw new Error('Test not implemented');
    });

    it ('should edit a plan', function (done) {
        throw new Error('Test not implemented');
    });
});
