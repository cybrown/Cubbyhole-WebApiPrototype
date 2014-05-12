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
            var file = JSON.parse(body);
            file.should.have.property('id', 4);
            file.should.have.property('name', 'file1');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', false);
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
            var file = JSON.parse(body);
            file.should.have.property('id', 5);
            file.should.have.property('name', 'file2');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', false);
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
            files[1].should.have.property('id', 4);
            files[1].should.have.property('name', 'file1');
            files[1].should.have.property('parent', 0);
            files[1].should.have.property('isFolder', false);
            files[2].should.have.property('id', 5);
            files[2].should.have.property('name', 'file2');
            files[2].should.have.property('parent', 0);
            files[2].should.have.property('isFolder', false);
            done();
        });
    });

    it ('should return one file', function (done) {
        req1({
            method: 'get',
            url: url + '/files/4'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var file = JSON.parse(body);
            file.should.have.property('id', 4);
            file.should.have.property('name', 'file1');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', false);
            done();
        });
    });

    it ('should return one file 2', function (done) {
        req1({
            method: 'get',
            url: url + '/files/5'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var file = JSON.parse(body);
            file.should.have.property('id', 5);
            file.should.have.property('name', 'file2');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', false);
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
            var file = JSON.parse(body);
            file.should.have.property('id', 4);
            file.should.have.property('name', 'newFile1');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', false);
            done();
        });
    });

    it ('should return one file 3', function (done) {
        req1({
            method: 'get',
            url: url + '/files/4'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var file = JSON.parse(body);
            file.should.have.property('id', 4);
            file.should.have.property('name', 'newFile1');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', false);
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
            var file = JSON.parse(body);
            file.should.have.property('id', 7);
            file.should.have.property('name', 'folder1');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', true);
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
            var file = JSON.parse(body);
            file.should.have.property('id', 8);
            file.should.have.property('name', 'notAFolder');
            file.should.have.property('parent', 0);
            file.should.have.property('isFolder', false);
            done();
        });
    });

    it ('should upload file data', function (done) {
        req1({
            method: 'put',
            url: url + '/files/2/raw',
            body: 'test content'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should download file data', function (done) {
        req1({
            method: 'get',
            url: url + '/files/2/raw'
        }, function (err, response, body) {
            response.should.have.status(200);
            body.should.eql('test content');
            done();
        });
    });

    it ('should not upload file data to an unexisting file', function (done) {
        req1({
            method: 'put',
            url: url + '/files/42/raw',
            body: 'test content'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });

    it ('should not get file data from an unexisting file', function (done) {
        req1({
            method: 'get',
            url: url + '/files/42/raw'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });

    it ('should not get file data from a file without data', function (done) {
        req1({
            method: 'get',
            url: url + '/files/1/raw'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });
});
