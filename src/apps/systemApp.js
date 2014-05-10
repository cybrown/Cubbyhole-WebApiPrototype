var express = require('express');

module.exports = function (loadMockData) {
    var systemApp = express();

    systemApp.get('/system/reset', function (req, res) {
        return loadMockData().then(function () {
            res.send('');
        });
    });

    systemApp.get('/ping', function (req, res) {
        res.send('pong');
    });

    systemApp.get('/authping', function (req, res) {
        res.send('pong');
    });

    return systemApp;
};
