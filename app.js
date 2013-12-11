
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

var files = [
    {
        id: 1,
        name: "file1",
        parent: 1,
        isFolder: false,
        cdate: new Date(),
        mdate: new Date(),
        owner: 1,
        size: 500,
        url: "AFBA34A2A11AB13EEBA"
    },
    {
        id: 2,
        name: "file2",
        parent: 1,
        isFolder: false,
        cdate: new Date(),
        mdate: new Date(),
        owner: 1,
        size: 500,
        url: "AFBA34A2A11AB13EEBA"
    },
    {
        id: 3,
        name: "file3",
        parent: 1,
        isFolder: false,
        cdate: new Date(),
        mdate: new Date(),
        owner: 1,
        size: 500,
        url: "AFBA34A2A11AB13EEBA"
    }
];

// FILES

app.get('/files', function (req, res) {

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
