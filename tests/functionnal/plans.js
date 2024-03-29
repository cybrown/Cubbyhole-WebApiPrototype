var request = require('request');

describe ('Plan Web Service', function () {

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

    it ('should not reads plans if user is not level 30', function (done) {
        request({
            method: 'get',
            url: url + '/plans',
            auth: {
                user: 'user.level10',
                pass: 'pass'
            }
        }, function (err, response, body) {
            response.statusCode.should.eql(403);
            done();
        });
    });

    it ('should not add a plan if user is not level 30', function (done) {
        request({
            method: 'put',
            url: url + '/plans',
            form: {
                name: 'first plan',
                price: 10,
                bandwidthDownload: 100,
                bandwidthUpload: 100,
                space: 30,
                shareQuota: 30,
                idpaypal: 'okok'
            },
            auth: {
                user: 'user.level10',
                pass: 'pass'
            }
        }, function (err, response, body) {
            response.statusCode.should.eql(403);
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
                shareQuota: 30,
                idpaypal: 'abcd'
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
                'shareQuota': 30,
                'idpaypal': 'abcd'
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
                shareQuota: 300,
                idpaypal: 'efgh'
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
                'shareQuota': 300,
                idpaypal: 'efgh'
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
            var plans = JSON.parse(body);
            plans.length.should.eql(5);
            done();
        });
    });

    it ('should get a plan', function (done) {
        req1({
            method: 'get',
            url: url + '/plans/4'
        }, function (err, res, body) {
            res.should.have.status(200);
            var plan = JSON.parse(body);
            plan.should.have.property('id', 4);
            plan.should.have.property('name', 'first plan');
            plan.should.have.property('price', 10);
            plan.should.have.property('bandwidthDownload', 100);
            plan.should.have.property('bandwidthUpload', 100);
            plan.should.have.property('space', 30);
            plan.should.have.property('shareQuota', 30);
            plan.should.have.property('idpaypal', 'abcd');
            done();
        });
    });

    it ('should delete a plan', function (done) {
        req1({
            method: 'delete',
            url: url + '/plans/4'
        }, function (err, response, body) {
            response.should.have.status(200);
            done();
        });
    });

    it ('should not get a plan', function (done) {
        req1({
            method: 'delete',
            url: url + '/plans/4'
        }, function (err, response, body) {
            response.should.have.status(404);
            done();
        });
    });

    it ('should edit a plan name', function (done) {
        req1({
            method: 'post',
            url: url + '/plans/3',
            form: {
                name: 'toto plan'
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var plan = JSON.parse(body);
            plan.id.should.eql(3);
            plan.name.should.eql('toto plan');
            done();
        });
    });

    it ('should edit a plan idpaypal', function (done) {
        req1({
            method: 'post',
            url: url + '/plans/3',
            form: {
                idpaypal: 'newidpaypal'
            }
        }, function (err, response, body) {
            response.should.have.status(200);
            var plan = JSON.parse(body);
            plan.id.should.eql(3);
            plan.idpaypal.should.eql('newidpaypal');
            done();
        });
    });
});
