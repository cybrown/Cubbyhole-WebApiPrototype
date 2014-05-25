'use strict';

var express         = require('express');
var http            = require('http');
var cors            = require('cors');
var Plugme = require('plugme').Plugme;
var mysql = require('mysql');
var Q = require('q');

var FileRepository = require('./repositories/FileRepository');
var PlanRepository = require('./repositories/PlanRepository');
var AccountRepository = require('./repositories/AccountRepository');
var SqlHelper = require('./libs/SqlHelper');

var plug = new Plugme();

plug.set('app', ['fileController', 'accountController', 'planController', 'systemController', 'authMiddleware'], function (fileController, accountController, planController, systemController, authMiddleware) {
    var app = express();

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.multipart());
    app.use(express.methodOverride());

    app.use(function (req, res, next) {
        if (req.url.indexOf('raw') === -1) {
            cors()(req, res, next);
        } else {
            next();
        }
    });

    app.use('/files', authMiddleware);
    app.use('/accounts', authMiddleware);
    app.use('/plans', authMiddleware);
    app.use('/authping', authMiddleware);

    // development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

    app.use('/', systemController);
    app.use('/files', fileController);
    app.use('/accounts', accountController);
    app.use('/plans', planController);

    return app;
});

plug.set('authMiddleware', ['accountRepository'], function (accountRepository) {
    return express.basicAuth(function (username, password, done) {
        if (username === 'user' && password === 'pass') {
            done(null, {
                id: 1,
                username: 'user',
                password: 'pass',
                level: 100,
                plan: 0
            });
        } else if (username === 'user.level10' && password === 'pass') {
            done(null, {
                id: 1,
                username: 'user.level10',
                password: 'pass',
                level: 10,
                plan: 0
            });
        } else {
            accountRepository.findByUsernameAndPassword(username, password).then(function (account) {
                done(null, account);
            }).catch(function (err) {
                done(err);
            });
        }
    });
});

plug.set('loadMockData', ['fileRepository', 'planRepository', 'accountRepository'], function (fileRepository, planRepository, accountRepository) {
    return function () {
        var filesData = require('./data/files.json');
        var plansData = require('./data/plans.json');
        var accountsData = require('./data/accounts.json');

        var clone = function (obj) {
            return Object.keys(obj).reduce(function (prev, key) {
                prev[key] = obj[key];
                return prev;
            }, {});
        };

        var accountPromise = accountRepository.clean().then(function () {
            return Q.all(accountsData.map(function (account) {
                return accountRepository.save(clone(account));
            }));
        });

        var planPromise = planRepository.clean().then(function () {
            return Q.all(plansData.map(function (plan) {
                return planRepository.save(clone(plan));
            }));
        });

        var filePromise = fileRepository.clean().then(function () {
            return Q.all(filesData.map(function (file) {
                return fileRepository.save(clone(file));
            }));
        });

        return Q.all([accountPromise, filePromise, planPromise]);
    };
});

plug.set('mysqlConnection', function () {
    var dbConf = require('./conf/db.json');
    var connection = mysql.createConnection(dbConf);
    connection.connect();
    return connection;
});

plug.set('fileSqlHelper', ['mysqlConnection'], function (mysqlConnection) {
    var fileSqlHelper = new SqlHelper();
    fileSqlHelper.PK_NAME = 'id';
    fileSqlHelper.TABLE_NAME = 'files';
    fileSqlHelper.COLUMN_CDATE = 'cdate';
    fileSqlHelper.COLUMN_MDATE = 'mdate';
    fileSqlHelper.setMdateOnUpdate = false;
    fileSqlHelper.TABLE_FIELDS = [
        'name',
        'parent_id',
        'isFolder',
        'owner_id',
        'size',
        'url',
        'cdate',
        'mdate'
    ];
    fileSqlHelper.connection = mysqlConnection;
    return fileSqlHelper;
});

plug.set('planSqlHelper', ['mysqlConnection'], function (mysqlConnection) {
    var planSqlHelper = new SqlHelper();
    planSqlHelper.PK_NAME = 'id';
    planSqlHelper.TABLE_NAME = 'plans';
    planSqlHelper.COLUMN_CDATE = 'cdate';
    planSqlHelper.TABLE_FIELDS = [
        'name',
        'price',
        'bandwidthDownload',
        'bandwidthUpload',
        'space',
        'shareQuota'
    ];
    planSqlHelper.connection = mysqlConnection;
    return planSqlHelper;
});

plug.set('accountSqlHelper', ['mysqlConnection'], function (mysqlConnection) {
    var accountSqlHelper = new SqlHelper();
    accountSqlHelper.PK_NAME = 'id';
    accountSqlHelper.TABLE_NAME = 'accounts';
    accountSqlHelper.COLUMN_CDATE = 'cdate';
    accountSqlHelper.TABLE_FIELDS = [
        'username',
        'password',
        'plan_id',
        'level'
    ];
    accountSqlHelper.connection = mysqlConnection;
    return accountSqlHelper;
});

plug.set('fileRepository', ['fileSqlHelper'], function (fileSqlHelper) {
    var fileRepository = new FileRepository();
    fileRepository.sql = fileSqlHelper;
    return fileRepository;
});

plug.set('planRepository', ['planSqlHelper'], function (planSqlHelper) {
    var planRepository = new PlanRepository();
    planRepository.sql = planSqlHelper;
    return planRepository;
});

plug.set('accountRepository', ['accountSqlHelper'], function (accountSqlHelper) {
    var accountRepository = new AccountRepository();
    accountRepository.sql = accountSqlHelper;
    return accountRepository;
});

plug.set('fileController', ['fileRepository'], function (fileRepository) {
    return require('./controllers/fileController')(fileRepository);
});

plug.set('accountController', ['accountRepository', 'planRepository'], function (accountRepository, planRepository) {
    return require('./controllers/accountController')(accountRepository, planRepository);
});

plug.set('planController', ['planRepository'], function (planRepository) {
    return require('./controllers/planController')(planRepository);
});

plug.set('systemController', ['loadMockData'], function (loadMockData) {
    return require('./controllers/systemController')(loadMockData);
});

plug.set('start', ['app'], function (app) {
    app.get('/files/:file/shares', function (req, res) {

    });

    app.get('/files/:id/shares/:userId', function(req, res) {

    });

    app.post('/files/:id/shares/:userId', function(req, res) {

    });

    app.delete('/files/:id/shares/:user', function(req, res) {

    });

    app.post('/files/:id/genurl', function(req, res) {

    });

    http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
    });
});

plug.onError(function (err) {
    console.trace(err);
});

plug.start();
