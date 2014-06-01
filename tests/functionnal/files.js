var request = require('request');

describe ('File Web Service', function () {

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
            file.should.have.property('id', 9);
            file.should.have.property('name', 'file1');
            file.should.have.property('parent', 7);
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
            file.should.have.property('id', 10);
            file.should.have.property('name', 'file2');
            file.should.have.property('parent', 7);
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
            files[0].should.have.property('id', 9);
            files[0].should.have.property('name', 'file1');
            files[0].should.have.property('parent', 7);
            files[0].should.have.property('isFolder', false);
            files[1].should.have.property('id', 10);
            files[1].should.have.property('name', 'file2');
            files[1].should.have.property('parent', 7);
            files[1].should.have.property('isFolder', false);
            done();
        });
    });

    it ('should list the content of a folder', function (done) {
        req1({
            method: 'get',
            url: url + '/files/4/list'
        }, function (err, response, body) {
            response.should.have.status(200);
            var files = JSON.parse(body);
            files[0].should.have.property('id', 5);
            files[0].should.have.property('name', 'file2');
            files[0].should.have.property('parent', 4);
            files[0].should.have.property('isFolder', false);
            files[1].should.have.property('id', 6);
            files[1].should.have.property('name', 'file3');
            files[1].should.have.property('parent', 4);
            files[1].should.have.property('isFolder', false);
            done();
        });
    });
    
    it ('should return an error if list not on a folder', function (done) {
        req1({
            method: 'get',
            url: url + '/files/5/list'
        }, function (err, response, body) {
            response.should.have.status(400);
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
            file.should.have.property('isFolder', true);
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
            file.should.have.property('parent', 4);
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
            file.should.have.property('isFolder', true);
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
            file.should.have.property('isFolder', true);
            done();
        });
    });

    it ('should copy one file', function (done) {
        req1({
            method: 'post',
            url: url + '/files/4/copy',
            form: {
                name: 'file1copy'
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var resp = JSON.parse(body);
            resp.id.should.eql(11);
            resp.name.should.eql('file1copy');
            resp.parent.should.eql(0);
            done();
        });
    });

    it ('should delete one file', function (done) {
        req1({
            method: 'delete',
            url: url + '/files/6'
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            done();
        });
    });

    it ('should not return one file', function (done) {
        req1({
            method: 'get',
            url: url + '/files/6'
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
            file.should.have.property('id', 12);
            file.should.have.property('name', 'folder1');
            file.should.have.property('parent', 7);
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
            file.should.have.property('id', 13);
            file.should.have.property('name', 'notAFolder');
            file.should.have.property('parent', 7);
            file.should.have.property('isFolder', false);
            done();
        });
    });

    it ('should upload file data', function (done) {
        req1({
            method: 'put',
            url: url + '/files/5/raw',
            body: 'test content'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should download file data', function (done) {
        req1({
            method: 'get',
            url: url + '/files/5/raw'
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
            url: url + '/files/4/raw'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });

    it ('should create one folder for recursive deletion', function (done) {
        req1({
            method: 'put',
            url: url + '/files/',
            form: {
                name: 'toDeleteRec',
                parent: 0,
                isFolder: true
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            file.should.have.property('id', 14);
            file.should.have.property('name', 'toDeleteRec');
            file.should.have.property('parent', 7);
            file.should.have.property('isFolder', true);
            done();
        });
    });

    it ('should create one file in previous folder', function (done) {
        req1({
            method: 'put',
            url: url + '/files/',
            form: {
                name: 'fileToDeleteRec',
                parent: 14,
                isFolder: false
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            file.should.have.property('id', 15);
            file.should.have.property('name', 'fileToDeleteRec');
            file.should.have.property('parent', 14);
            file.should.have.property('isFolder', false);
            done();
        });
    });

    it ('should delete folder recursively', function (done) {
        req1({
            method: 'delete',
            url: url + '/files/14'
        }, function (err, response, body) {
            response.should.have.status(200);
            body.should.eql('');
            done();
        });
    });

    it ('should have deleted folder', function (done) {
        req1({
            method: 'get',
            url: url + '/files/14'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });

    it ('should have deleted file in folder', function (done) {
        req1({
            method: 'get',
            url: url + '/files/15'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });

    var gen_url = '';

    it ('should generate a public url', function (done) {
    	req1({
    		method: 'post',
    		url: url + '/files/5/link'
    	}, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            gen_url = file.permalink;
            file.permalink.length.should.eql(10);
            done();
    	});
    });

    it ('should get the same public url', function (done) {
        req1({
            method: 'post',
            url: url + '/files/5/link'
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            file.permalink.should.eql(gen_url);
            done();
        });
    });

    it ('should not get a public url for a file from another account', function (done) {
        req1({
            method: 'post',
            url: url + '/files/2/link'
        }, function (err, response, body) {
            response.should.have.status(403);
            done();
        });
    });

    it ('should not get a public url for a folder', function (done) {
        req1({
            method: 'post',
            url: url + '/files/4/link'
        }, function (err, response, body) {
            response.should.have.status(400);
            done();
        });
    });

    it ('should put content in file', function (done) {
        req1({
            method: 'put',
            url: url + '/files/5/raw',
            body: 'Hello, data !'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should get file content with permalink', function (done) {
        request({
            method: 'get',
            url: url + '/f/' + gen_url
        }, function (err, response, body) {
            response.should.have.status(200);
            body.should.eql('Hello, data !');
            done();
        });
    });

    var testdirid = 0;

    it ('should create a directory', function (done) {
        req1({
            method: 'put',
            url: url + '/files/',
            form: {
                parent: 0,
                name: 'testdir'
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            testdirid = file.id;
            done();
        })
    });

    it ('should move a file', function () {
        req1({
            method: 'post',
            url: url + '/files/5',
            form: {
                parent: testdirid
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            file.should.have.property('parent', testdirid);
        });
    });
});
