
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

// SYSTEM

app.get('/system/reset', function (req, res) {
    accounts.entries.length = 0;
    accounts.lastId = 1;
    files.entries.length = 0;
    files.lastId = 1;
    shares.entries.length = 0;
    shares.lastId = 1;
    res.send('');
});

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
    if (selectedFile) {
        res.json(selectedFile);
    } else {
        res.status(404).send('');
    }
});

app.put('/files', function (req, res) {
    var file = {};
    var hasData = false;
    if (req.body.hasOwnProperty('name')) {
        file.name = req.body.name;
        hasData = true;
    }
    if (req.body.hasOwnProperty('parent')) {
        file.parent = Number(req.body.parent);
        hasData = true;
    }
    if (req.body.hasOwnProperty('isFolder')) {
        file.isFolder = Boolean(JSON.parse(req.body.isFolder));
        hasData = true;
    }
    if (hasData) {
        file.id = files.lastId++;
        files.entries.push(file);
        res.json(file);
    }
    res.status(400).send('');
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
            fileToModify.parent = Number(req.body.parent);
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

app.get('/files/:id/shares', function(req, res) {

    var selectedFile = null;

    for (var i = 0; i < files.length; i++) {
        if (files[i].id == req.params.id) {
            selectedFile = files[i];
            break;
        }
    }

    if (selectedFile) {
        shares.filter(function(share) {
           if (share.id === selectedFile.id) {
               res.send(share)
           }
        });
    } else {
        res.status(404).send('');
    }

});

app.get('/files/:id/shares/:userId', function(req, res) {
    var user            = null;
    var selectedFile    = null;
    var shareByUser     = null;

    for (var i = 0; i < files.length; i++) {
        if (files[i].id == req.params.id) {
            selectedFile = files[i];
            break;
        }
    }

    for (var j = 0; j < accounts.length; j++) {
        if (accounts[j].id == req.params.userId) {
            user = accounts[j];
            break;
        }
    }

    if (selectedFile && user) {
        for (var k = 0; k < shares.length; k++) {
            if (user.id == shares[k].user) {
                shareByUser = shares[k];
                res.send(shareByUser);
            }
        }
    } else {
        res.send("");
    }


});

app.post('/files/:id/shares/:userId', function(req, res) {

});

app.delete('/files/:id/shares/:user', function(req, res) {

});

app.post('/files/:id/genurl', function(req, res) {

});

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
        account.plan = Number(req.body.plan);
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
        account.plan = Number(req.body.plan);
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
