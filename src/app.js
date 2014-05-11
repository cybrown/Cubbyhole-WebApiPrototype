'use strict';

var express         = require('express');
var http            = require('http');
var cors            = require('cors');
var Plugme = require('plugme').Plugme;
var mysql = require('mysql');
var Q = require('q');

var FileRepository = require('./FileRepository');
var PlanRepository = require('./PlanRepository');
var AccountRepository = require('./AccountRepository');
var SqlHelper = require('./libs/SqlHelper');

var plug = new Plugme();

plug.set('app', ['fileExpressApp', 'accountExpressApp', 'planExpressApp', 'systemExpressApp'], function (fileExpressApp, accountExpressApp, planExpressApp, systemExpressApp) {
    var app = express();

    // all environments
    app.set('port', process.env.PORT || 3000);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.multipart());
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

    app.use('/', systemExpressApp);
    app.use('/files', fileExpressApp);
    app.use('/accounts', accountExpressApp);
    app.use('/plans', planExpressApp);

    return app;
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
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'cubbyhole',
        password: 'cubbyhole',
        database: 'cubbyhole_proto'
    });
    connection.connect();
    return connection;
});

plug.set('fileSqlHelper', ['mysqlConnection'], function (mysqlConnection) {
    var fileSqlHelper = new SqlHelper();
    fileSqlHelper.PK_NAME = 'id';
    fileSqlHelper.TABLE_NAME = 'files';
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

plug.set('accountRepository', function () {
    return new AccountRepository();
});

plug.set('fileExpressApp', ['fileRepository'], function (fileRepository) {
    return require('./apps/fileApp')(fileRepository);
});

plug.set('accountExpressApp', ['accountRepository', 'planRepository'], function (accountRepository, planRepository) {
    return require('./apps/accountApp')(accountRepository, planRepository);
});

plug.set('planExpressApp', ['planRepository'], function (planRepository) {
    return require('./apps/planApp')(planRepository);
});

plug.set('systemExpressApp', ['loadMockData'], function (loadMockData) {
    return require('./apps/systemApp')(loadMockData);
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

plug.start();
