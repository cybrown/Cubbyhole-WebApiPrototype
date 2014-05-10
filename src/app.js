'use strict';

var express         = require('express');
var http            = require('http');
var cors            = require('cors');
var Plugme = require('plugme').Plugme;
var mysql = require('mysql');

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
        var filesData = require('./data/files')();
        var accountsData = require('./data/accounts')();
        accountRepository.lastId = accountsData.lastId;
        accountRepository.entries = accountsData.entries;

        var plansData = require('./data/plans')();
        planRepository.lastId = plansData.lastId;
        planRepository.entries = plansData.entries;

        return fileRepository.clean().then(function () {
            return filesData.entries.map(function (file) {
                return fileRepository.save(file);
            });
        });
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

plug.set('fileRepository', ['fileSqlHelper'], function (fileSqlHelper) {
    var fileRepository = new FileRepository();
    fileRepository.sql = fileSqlHelper;
    return fileRepository;
});

plug.set('planRepository', function () {
    return new PlanRepository();
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
