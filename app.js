
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var accounts = require('./data/accounts');
var files = require('./data/files');
var shares = require('./data/shares');

// FILES

app.get('/files', function (req, res) {
    res.json(files.filter(function(file) {
        return file.parent === 0;
    }));
});

app.get('/files/:id', function (req, res) {
    var selectedFiles = files.filter(function (file) {
        return file.id == req.params.id;
    });
    res.json(selectedFiles.length ? selectedFiles[0] : null);
});

app.put('/files', function (req, res) {

});

app.post('/files/:id', function (req, res) {

});

app.delete('/files/:id', function (req, res) {

});

// SHARES

// ACCOUNTS

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
