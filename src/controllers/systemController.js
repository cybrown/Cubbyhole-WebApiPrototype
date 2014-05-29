var express = require('express');
var Q = require('q');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var HttpResponse = require('../libs/HttpResponse');
var Convert = CoreDecorators.Convert;
var ExpressRequest = CoreDecorators.ExpressRequest;

module.exports = function (loadMockData, accountRepository, fileRepository) {
    return express()
        .post('/register', Decorate(
            ExpressRequest(),
            function (username, password) {
                var user = {};
                user.plan = 0;
                user.username = username;
                user.level = 10;
                return accountRepository.save(user).then(function () {
                    return accountRepository.savePassword(user, password);
                }).then(function () {
                    return;
                });
            }
        ))
        .get('/system/reset', Decorate(
            ExpressRequest(),
            function () {
                var user = {
                    username: 'user',
                    level: 100,
                    plan: 0
                };
                var user_level10 = {
                    username: 'user.level10',
                    level: 10,
                    plan: 0
                };
                return loadMockData().then(function () {
                    return accountRepository.save(user);
                }).then(function () {
                    return accountRepository.savePassword(user, 'pass');
                }).then(function () {
                    return accountRepository.save(user_level10);
                }).then(function () {
                    return accountRepository.savePassword(user_level10, 'pass');
                }).then(function () {
                    return;
                })
            }
        ))
        .get('/ping', function (req, res) {
            res.send('pong');
        })
        .get('/authping', function (req, res) {
            res.send('pong');
        })
        .get('/crash', function (res, res) {
            setTimeout(function () {
                throw new Error('User crash');
            }, 500);
            res.send('crash in 500ms');
        })
        .get('/f/:file', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.findByPermalink.bind(fileRepository)),
            function (file) {
                return Q.promise(function (resolve, reject) {
                    var fs = require('fs');
                    if (file.url) {
                        fs.exists('files/' + file.url, function (exists) {
                            if (exists) {
                                var response = new HttpResponse(fs.createReadStream('files/' + file.url));
                                response.headers = {
                                    'Content-Disposition':  'attachment; filename='+file.name
                                };
                                resolve(response);
                                return;
                            } else {
                                var err = new Error();
                                err.status = 404;
                                reject(err);
                            }
                        });
                    } else {
                        var err = new Error();
                        err.status = 404;
                        reject(err);
                    }
                });
            }
        ));
};
