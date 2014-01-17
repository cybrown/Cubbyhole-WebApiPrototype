var should = require('should');
var request = require('request');

describe ('File Web Service', function () {

    var scheme = 'http://';
    var host = 'localhost';
    var port = 3000;

    var url = scheme + host + ':' + port;

    it ('should reset data', function (done) {
        request.get(url + '/system/reset', function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should add a file', function (done) {
        request.put({
            url: url + '/files',
            form: {
                name: 'file1',
                parent: 0
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'name': 'file1',
                'parent': 0
            });
            done();
        });
    });

    it ('should add another file', function (done) {
        request.put({
            url: url + '/files',
            form: {
                name: 'file2',
                parent: 0
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 2,
                'name': 'file2',
                'parent': 0
            });
            done();
        });
    });

    it ('should return two files', function (done) {
        request.get({
            url: url + '/files'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql([
                {
                    'id': 1,
                    'name': 'file1',
                    'parent': 0
                },
                {
                    'id': 2,
                    'name': 'file2',
                    'parent': 0
                }
            ]);
            done();
        });
    });

    it ('should return one file', function (done) {
        request.get({
            url: url + '/files/1'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'name': 'file1',
                'parent': 0
            });
            done();
        });
    });

    it ('should return one file', function (done) {
        request.get({
            url: url + '/files/2'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 2,
                'name': 'file2',
                'parent': 0
            });
            done();
        });
    });

    it ('should rename one file', function (done) {
        request.post({
            url: url + '/files/1',
            form: {
                name: 'newFile1'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'name': 'newFile1',
                'parent': 0
            });
            done();
        });
    });

    it ('should return one file', function (done) {
        request.get({
            url: url + '/files/1'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 1,
                'name': 'newFile1',
                'parent': 0
            });
            done();
        });
    });

    it ('should copy one file', function (done) {
        request.post({
            url: url + '/files/1?copy=true',
            form: {
                name: 'file1copy'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 3,
                'name': 'file1copy',
                'parent': 0
            });
            done();
        });
    });

    it ('should delete one file', function (done) {
        request.del({
            url: url + '/files/3'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            done();
        });
    });

    it ('should not return one file', function (done) {
        request.get({
            url: url + '/files/3'
        }, function (err, response, body) {
            response.statusCode.should.equal(404);
            done();
        });
    });
});
