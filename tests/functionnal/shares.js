var request = require('request');

describe ('Shares', function () {

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

    var req_user_a = function (options, next) {
        options['auth'] = {
            user: 'user_a',
            pass: 'pass_a'
        };
        request(options, next);
    };

    var req_user_b = function (options, next) {
        options['auth'] = {
            user: 'user_b',
            pass: 'pass_b'
        };
        request(options, next);
    };

    it ('should reset data', function (done) {
        req1({
            method: 'get',
            url: url + '/system/reset'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should add an account for user_a', function (done) {
        req1({
            method: 'put',
            url: url + '/accounts',
            form: {
                username: 'user_a',
                password: 'pass_a',
                plan: 1,
                level: 10
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var account = JSON.parse(body);
            account.should.have.property('id', 6);
            account.should.have.property('username', 'user_a');
            account.should.have.property('plan', 1);
            account.should.have.property('level', 10);
            done();
        });
    });

    it ('should add an account for user_b', function (done) {
        req1({
            method: 'put',
            url: url + '/accounts',
            form: {
                username: 'user_b',
                password: 'pass_b',
                plan: 1,
                level: 10
            }
        }, function (err, response, body) {
            response.statusCode.should.equal(200);
            var account = JSON.parse(body);
            account.should.have.property('id', 7);
            account.should.have.property('username', 'user_b');
            account.should.have.property('plan', 1);
            account.should.have.property('level', 10);
            done();
        });
    });

    it ('should create a file', function (done) {
        req_user_a({
            method: 'put',
            url: url + '/files/',
            form: {
                name: 'sharedfile',
                parent: 0
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var file = JSON.parse(body);
            file.should.have.property('id', 11);
            file.should.have.property('name', 'sharedfile');
            file.should.have.property('parent', 9);
            done();
        });
    });

    it ('should add content to file', function (done) {
        req_user_a({
            method: 'put',
            url: url + '/files/11/raw',
            body: 'user_a file'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should have added content to file', function (done) {
        req_user_a({
            method: 'get',
            url: url + '/files/11/raw'
        }, function (err, response, body) {
            response.should.have.status(200);
            body.should.eql('user_a file');
            done();
        });
    });

    it ('should not be possible to access file from another user', function (done) {
        req_user_b({
            method: 'get',
            url: url + '/files/11'
        }, function (err, response, body) {
            response.should.have.status(403);
            done();
        });
    });

    it ('should not be possible to access file content from another user', function (done) {
        req_user_b({
            method: 'get',
            url: url + '/files/11/raw'
        }, function (err, response, body) {
            response.should.have.status(403);
            done();
        });
    });

    it ('should add a read only share on a file', function (done) {
        req_user_a({
            method: 'put',
            url: url + '/files/11/shares/READ',
            form: {
                account: 7
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var share = JSON.parse(body);
            share.file.should.eql(11);
            share.account.should.eql(7);
            share.permission.should.eql('READ');
            done();
        });
    });

    it ('should put only one permission per file and account', function (done) {
        req_user_a({
            method: 'put',
            url: url + '/files/11/shares/READ',
            form: {
                account: 7
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var share = JSON.parse(body);
            share.file.should.eql(11);
            share.account.should.eql(7);
            share.permission.should.eql('READ');
            done();
        });
    });

    it ('should return the list of shares on a file', function (done) {
        req_user_a({
            method: 'get',
            url: url + '/files/11/shares'
        }, function (err, response, body) {
            response.should.have.status(200);
            var shares = JSON.parse(body);
            shares[0].file.should.eql(11);
            shares[0].account.should.eql(7);
            shares[0].permission.should.eql('READ');
            done();
        });
    });

    it ('should be possible to access file after the share is set', function (done) {
        req_user_b({
            method: 'get',
            url: url + '/files/11'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should be possible to access file content after the share is set', function (done) {
        req_user_b({
            method: 'get',
            url: url + '/files/11/raw'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should be possible to remove the share', function (done) {
        req_user_a({
            method: 'delete',
            url: url + '/files/11/shares/READ',
            form: {
                account: 7
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should not be possible to access the file when the share is removed', function (done) {
        req_user_b({
            method: 'get',
            url: url + '/files/11'
        }, function (err, response, body) {
            response.should.have.status(403);
            done();
        });
    });
});