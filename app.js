
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
app.use(express.bodyParser());
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
    res.json(files.entries.filter(function(file) {
        return file.parent === 0;
    }));
});

app.get('/files/:id', function (req, res) {
    var selectedFile = null;
    for (var i = 0; i < files.entries.length; i++) {
        if (files.entries[i].id == req.params.id) {
            selectedFile = files.entries[i];
            break;
        }
    }
    res.json(selectedFile);
});

app.put('/files', function (req, res) {

});

app.post('/files/:id', function (req, res) {
    var selectedFile = null;

    for (var i = 0; i < files.entries.length; i++) {
        if (files.entries[i].id == req.params.id) {
            selectedFile = files.entries[i];
            break;
        }
    }

    if (selectedFile) {
        var fileToModify = selectedFile;
        if (req.query.hasOwnProperty('copy') && req.query.copy == 'true') {
            fileToModify = {};
            fileToModify.name = selectedFile.name,
            fileToModify.parent = selectedFile.parent,
            fileToModify.isFolder = selectedFile.isFolder,
            fileToModify.cdate = new Date(),
            fileToModify.mdate = new Date(),
            fileToModify.owner = selectedFile.owner,
            fileToModify.size = selectedFile.size,
            fileToModify.url = selectedFile.url
        }

        if (req.body.hasOwnProperty('file')) {
            fileToModify.parent = req.body.parent;
        }
        if (req.body.hasOwnProperty('name')) {
            fileToModify.name = req.body.name;
        }

        if (selectedFile != fileToModify) {
            fileToModify.id = files.lastId++;
            files.entries.push(fileToModify);
        }

        res.json(fileToModify);
    } else {
        res.status(404).send('');
    }

});

app.delete('/files/:id', function (req, res) {
    var index = -1;
    for (var i = 0; i < files.entries.length; i++) {
        if (files.entries[i].id == req.params.id) {
            index = i;
            break;
        }
    }
    if (index >= 0) {
        files.entries.splice(index, 1);
        res.send('');
    } else {
        res.status(404).send('');
    }
});

// SHARES

// ACCOUNTS

app.get('/accounts', function (req, res) {
    res.json(accounts.entries);
});

app.get('/accounts/:id', function (req, res) {
    var account = null;
    for (var i = 0; i < accounts.entries.length; i++) {
        if (accounts.entries[i].id == req.params.id) {
            account = accounts.entries[i];
            break;
        }
    }
    if (account) {
        res.json(account);
    } else {
        res.status(404).send('');
    }
});

app.post('/accounts/:id', function (req, res) {
    var account = null;
    for (var i = 0; i < accounts.entries.length; i++) {
        if (accounts.entries[i].id == req.params.id) {
            account = accounts.entries[i];
            break;
        }
    }
    if (!account) {
        res.status(404).send('');
    }
    if (req.body.hasOwnProperty('username')) {
        account.username = req.body.username;
    }
    if (req.body.hasOwnProperty('password')) {
        account.password = req.body.password;
    }
    if (req.body.hasOwnProperty('plan')) {
        account.plan = req.body.plan;
    }
    res.json(account);
});

app.put('/accounts', function (req, res) {
    var account = {};
    var hasData = false;
    if (req.body.hasOwnProperty('username')) {
        account.username = req.body.username;
        hasData = true;
    }
    if (req.body.hasOwnProperty('password')) {
        account.password = req.body.password;
        hasData = true;
    }
    if (req.body.hasOwnProperty('plan')) {
        account.plan = req.body.plan;
        hasData = true;
    }
    if (hasData) {
        account.id = accounts.lastId++;
        accounts.entries.push(account);
        res.send(account);
    } else {
        res.send('');
    }
});

app.delete('/accounts/:id', function (req, res) {
    var index = -1;
    for (var i = 0; i < accounts.entries.length; i++) {
        if (accounts.entries[i].id == req.params.id) {
            index = i;
            break;
        }
    }
    if (index >= 0) {
        accounts.entries.splice(index, 1);
        res.send('');
    } else {
        res.status(404).send('');
    }
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
