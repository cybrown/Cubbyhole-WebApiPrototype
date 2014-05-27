var express = require('express');
var Q = require('q');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var HttpResponse = require('../libs/HttpResponse');
var Convert = CoreDecorators.Convert;
var ExpressRequest = CoreDecorators.ExpressRequest;

module.exports = function (loadMockData, accountRepository, fileRepository) {
    var systemController = express();

    systemController.post('/register', Decorate(
        ExpressRequest(),
        function (username, password) {
            var user = {};
            user.plan = 0;
            user.username = username;
            user.password = password;
            user.level = 10;
            return accountRepository.save(user).then(function () {
                return;
            });
        }
    ));

    systemController.get('/system/reset', function (req, res) {
        return loadMockData().then(function () {
            var user = {
                username: 'user',
                password: 'pass',
                level: 100,
                plan: 0
            };
            var user_level10 = {
                username: 'user.level10',
                password: 'pass',
                level: 10,
                plan: 0
            };
            accountRepository.save(user).then(function () {
                return accountRepository.save(user_level10);
            }).then(function () {
                res.send('');
            });
        });
    });

    systemController.get('/ping', function (req, res) {
        res.send('pong');
    });

    systemController.get('/authping', function (req, res) {
        res.send('pong');
    });

    systemController.get('/crash', function (res, res) {
        setTimeout(function () {
            throw new Error('User crash');
        }, 500);
        res.send('crash in 500ms');
    });

    systemController.get('/f/:file', Decorate(
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

    return systemController;
};
