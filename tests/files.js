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
            var resp = JSON.parse(body);
            resp.id.should.eql(3);
            resp.name.should.eql('file1copy');
            resp.parent.should.eql(0);
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

    it ('should add a folder', function (done) {
        request.put({
            url: url + '/files',
            form: {
                name: 'folder1',
                parent: 0,
                isFolder: true
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'name': 'folder1',
                'parent': 0,
                'isFolder': true
            });
            done();
        });
    });

    it ('should add a file', function (done) {
        request.put({
            url: url + '/files',
            form: {
                name: 'notAFolder',
                parent: 0,
                isFolder: false
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 5,
                'name': 'notAFolder',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });
});
