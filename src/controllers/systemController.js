var express = require('express');

module.exports = function (loadMockData, accountRepository) {
    var systemController = express();

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

    return systemController;
};
