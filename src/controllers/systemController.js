var express = require('express');

module.exports = function (loadMockData) {
    var systemController = express();

    systemController.get('/system/reset', function (req, res) {
        return loadMockData().then(function () {
            res.send('');
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
