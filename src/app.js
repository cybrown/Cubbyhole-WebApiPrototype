'use strict';

//<editor-fold desc="Requires">

var express         = require('express');
var http            = require('http');
var cors            = require('cors');
var path            = require('path');
var Decorate        = require('./libs/decorate');
var CoreDecorators  = require('./libs/core_decorators');
var ExpressRequest  = CoreDecorators.ExpressRequest;
var Convert         = CoreDecorators.Convert;
var Ensure          = CoreDecorators.Ensure;
var Default         = CoreDecorators.Default;

//</editor-fold>

var app = express();

//<editor-fold desc="Configuration">

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(cors());

// auth
var authMiddleware = express.basicAuth('user', 'pass')

app.use('/files', authMiddleware);
app.use('/accounts', authMiddleware);
app.use('/plans', authMiddleware);
app.use('/authping', authMiddleware);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var accounts = require('./data/accounts')();
var files = require('./data/files')();
var shares = require('./data/shares')();
var plans = require('./data/plans')();

//</editor-fold>

// <editor-fold desc="Repositories">

var findFile = function (id) {
    var selectedFile;
    for (var i = 0; i < files.entries.length; i++) {
        if (files.entries[i].id == id) {
            selectedFile = files.entries[i];
            break;
        }
    }
    return selectedFile;
};

var deleteFile = function (file) {
    var index = -1;
    for (var i = 0; i < files.entries.length; i++) {
        if (files.entries[i].id == file.id) {
            index = i;
            break;
        }
    }
    if (index >= 0) {
        files.entries.splice(index, 1);
    }
};

var findPlan = function (id) {
    for (var i = 0; i < plans.entries.length; i++) {
        if (plans.entries[i].id == id) {
            return plans.entries[i];
        }
    }
};

var removePlan = function (plan) {
    for (var i = 0; i < plans.entries.length; i++) {
        if (plans.entries[i].id == plan.id) {
            plans.entries.splice(i, 1);
        }
    }
};

var findSharesByFileId = function (id) {
    return shares.filter(function (share) {
        return share.id == id;
    });
};

var findAccount = function (id) {
    for (var i = 0; i < accounts.entries.length; i++) {
        if (accounts.entries[i].id == id) {
            return accounts.entries[i];
        }
    }
};

var removeAccount = function (account) {
    for (var i = 0; i < accounts.entries.length; i++) {
        if (accounts.entries[i].id == account.id) {
            accounts.entries.splice(i, 1);
        }
    }
};

//</editor-fold>

//<editor-fold desc="System">

app.get('/system/reset', function (req, res) {
    accounts = require('./data/accounts')();
    shares = require('./data/shares')();
    plans = require('./data/plans')();
    files = require('./data/files')();
    res.send('');
});

app.get('/ping', function (req, res) {
    res.send('pong');
});

app.get('/authping', function (req, res) {
    res.send('pong');
});

//</editor-fold>

//<editor-fold desc="Plans">
app.get('/plans', Decorate(
    ExpressRequest(),
    function () {
        return plans.entries;
    }
));

app.get('/plans/:plan', Decorate(
    ExpressRequest(),
    Convert('plan', findPlan),
    function (plan) {
        return plan;
    }
));

app.delete('/plans/:plan', Decorate(
    ExpressRequest(),
    Convert('plan', findPlan),
    function (plan) {
        removePlan(plan);
    }
));

app.post('/plans/:plan', Decorate(
    ExpressRequest(['plan', '?name', '?price', '?bandwidthDownload', '?bandwidthUpload', '?space', '?shareQuota']),
    Convert('plan', findPlan),
    function (plan, name, price, bandwidthDownload, bandwidthUpload, space, shareQuota) {
        name !== undefined && (plan.name = name);
        price !== undefined && (plan.price = price);
        bandwidthDownload !== undefined && (plan.bandwidthDownload = bandwidthDownload);
        bandwidthUpload !== undefined && (plan.bandwidthUpload = bandwidthUpload);
        space !== undefined && (plan.space = space);
        shareQuota !== undefined && (plan.shareQuota = shareQuota);
    return plan;
}));

app.put('/plans', Decorate(
    ExpressRequest(),
    function(name, price, bandwidthDownload, bandwidthUpload, space, shareQuota) {
        var plan = {};
        plan.name = name;
        plan.price = price;
        plan.bandwidthDownload = bandwidthDownload;
        plan.bandwidthUpload = bandwidthUpload;
        plan.space = space;
        plan.shareQuota = shareQuota;
        plan.id = plans.lastId++;
        plans.entries.push(plan);
        return plan;
    }
));

//</editor-fold>

//<editor-fold desc="Files">
app.get('/files', Decorate(
    ExpressRequest(),
    function () {
        return files.entries.filter(function(file) {
            return file.parent == 0;
        });
    })
);

app.get('/files/:file', Decorate(
    ExpressRequest(),
    Convert('file', findFile),
    function (file) {
        return file;
    })
);

app.put('/files', Decorate(
    ExpressRequest(['name', 'parent', '?isFolder']),
    Default('isFolder', false),
    Ensure('isFolder', 'boolean'),
    //Ensure('parent', 'number'),
    function (name, parent, isFolder) {
        var file = {};
        file.name = name;
        file.parent = parent;
        file.isFolder = isFolder;
        file.id = files.lastId++;
        files.entries.push(file);
        return file;
    }
));

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

app.delete('/files/:file', Decorate(
    ExpressRequest(),
    Convert('file', findFile),
    function (file) {
    deleteFile(file)
}
));

//</editor-fold>

//<editor-fold desc="Shares">
app.get('/files/:file/shares', Decorate(
    ExpressRequest(),
    Convert('file', findFile),
    function (file) {
        return findSharesByFileId(file.id);
    })
);

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

//</editor-fold>

//<editor-fold desc="Accounts">

app.get('/accounts', Decorate(
    ExpressRequest(),
    function () {
        return accounts.entries;
    })
);

app.get('/accounts/:account', Decorate(
    ExpressRequest(),
    Convert('account', findAccount),
    function (account) {
        return account;
    })
);

app.post('/accounts/:account', Decorate(
    ExpressRequest(['account', '?username', '?password', '?plan']),
    Convert({account: findAccount, plan: findPlan}),
    function (account, username, password, plan) {
        if (username !== undefined) {
            account.username = username;
        }
        if (password !== undefined) {
            account.password = password;
        }
        if (plan !== undefined) {
            account.plan = plan.id;
        }
        return account;
    }
));

app.put('/accounts', Decorate(
    ExpressRequest(),
    Convert('plan', findPlan),
    function (username, password, plan) {
        var account = {};
        account.username = username;
        account.password = password;
        account.plan = plan.id;
        account.id = accounts.lastId++;
        accounts.entries.push(account);
        return account;
    })
);

app.delete('/accounts/:account', Decorate(
    ExpressRequest(),
    Convert('account', findAccount),
    function (account) {
        removeAccount(account);
    })
);

//</editor-fold>

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
