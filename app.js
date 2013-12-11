
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
    res.json(files.filter(function(file) {
        return file.parent === 0;
    }));
});

app.get('/files/:id', function (req, res) {
    var selectedFile = null;
    for (var i = 0; i < files.length; i++) {
        if (files[i].id == req.params.id) {
            selectedFile = files[i];
            break;
        }
    }
    res.json(selectedFile);
});

app.put('/files', function (req, res) {

});

app.post('/files/:id', function (req, res) {
    var selectedFile = null;

    for (var i = 0; i < files.length; i++) {
        if (files[i].id == req.params.id) {
            selectedFile = files[i];
            break;
        }
    }

    if (selectedFile) {

        if (req.params.hasOwnProperty('file')) {
            selectedFile.parent = req.params.parent;
        }

        if (req.params.hasOwnProperty('name')) {
            selectedFile.name = req.params.name;
        }

        if (req.params.hasOwnProperty('copy')) {
            var copiedFile = {
                name: selectedFile.name,
                parent: selectedFile.parent,
                isFolder: selectedFile.isFolder,
                cdate: new Date(),
                mdate: new Date(),
                owner: selectedFile.owner,
                size: selectedFile.size,
                url: selectedFile.url
            }
        }

        if (req.params.hasOwnProperty('file') && req.params.hasOwnProperty('name')) {
            selectedFile.parent = req.params.parent;
            selectedFile.name = req.params.name;
        }
    }

});

app.delete('/files/:id', function (req, res) {
    var index = -1;
    for (var i = 0; i < files.length; i++) {
        if (files[i].id == req.params.id) {
            index = i;
            break;
        }
    }
    if (index >= 0) {
        files.splice(index, 1);
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
