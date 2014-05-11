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

    return systemController;
};
