var should = require('should');
var request = require('request');

describe ('File Web Service', function () {

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

    it ('should add a file', function (done) {
        req1({
            method: 'put',
            url: url + '/files',
            form: {
                name: 'file1',
                parent: 0
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'name': 'file1',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });

    it ('should not add a file, wrong isFile parameter', function (done) {
        req1({
            method: 'put',
            url: url + '/files',
            form: {
                name: 'file1abc',
                parent: 0,
                isFolder: 'abc'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(400);
            done();
        });
    });

    it ('should add another file', function (done) {
        req1({
            method: 'put',
            url: url + '/files',
            form: {
                name: 'file2',
                parent: 0
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 5,
                'name': 'file2',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });

    it ('should return two files', function (done) {
        req1({
            method: 'get',
            url: url + '/files'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var files = JSON.parse(body);
            files[1].should.eql({
                'id': 4,
                'name': 'file1',
                'parent': 0,
                'isFolder': false
            });
            files[2].should.eql({
                'id': 5,
                'name': 'file2',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });

    it ('should return one file', function (done) {
        req1({
            method: 'get',
            url: url + '/files/4'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'name': 'file1',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });

    it ('should return one file 2', function (done) {
        req1({
            method: 'get',
            url: url + '/files/5'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 5,
                'name': 'file2',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });

    it ('should rename one file', function (done) {
        req1({
            method: 'post',
            url: url + '/files/4',
            form: {
                name: 'newFile1'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'name': 'newFile1',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });

    it ('should return one file 2', function (done) {
        req1({
            method: 'get',
            url: url + '/files/4'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 4,
                'name': 'newFile1',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });

    it ('should copy one file', function (done) {
        req1({
            method: 'post',
            url: url + '/files/4?copy=true',
            form: {
                name: 'file1copy'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var resp = JSON.parse(body);
            resp.id.should.eql(6);
            resp.name.should.eql('file1copy');
            resp.parent.should.eql(0);
            done();
        });
    });

    it ('should delete one file', function (done) {
        req1({
            method: 'delete',
            url: url + '/files/3'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            done();
        });
    });

    it ('should not return one file', function (done) {
        req1({
            method: 'get',
            url: url + '/files/3'
        }, function (err, response, body) {
            response.statusCode.should.equal(404);
            done();
        });
    });

    it ('should add a folder', function (done) {
        req1({
            method: 'put',
            url: url + '/files',
            form: {
                name: 'folder1',
                parent: 0,
                isFolder: true
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 7,
                'name': 'folder1',
                'parent': 0,
                'isFolder': true
            });
            done();
        });
    });

    it ('should add a file 2', function (done) {
        req1({
            method: 'put',
            url: url + '/files',
            form: {
                name: 'notAFolder',
                parent: 0,
                isFolder: false
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            JSON.parse(body).should.eql({
                'id': 8,
                'name': 'notAFolder',
                'parent': 0,
                'isFolder': false
            });
            done();
        });
    });
});
