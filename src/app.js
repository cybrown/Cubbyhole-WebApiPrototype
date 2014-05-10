'use strict';

var express         = require('express');
var http            = require('http');
var cors            = require('cors');
var mysql = require('mysql');

var FileRepository = require('./FileRepository');
var PlanRepository = require('./PlanRepository');
var AccountRepository = require('./AccountRepository');

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

function loadMockData () {
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

// MYSQL
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'cubbyhole',
    password: 'cubbyhole',
    database: 'cubbyhole_proto'
});
connection.connect();

var fileRepository = new FileRepository();
fileRepository.connection = connection;
var planRepository = new PlanRepository();
var accountRepository = new AccountRepository();

app.get('/system/reset', function (req, res) {
    return loadMockData().then(function () {
        res.send('');
    });
});

app.get('/ping', function (req, res) {
    res.send('pong');
});

app.get('/authping', function (req, res) {
    res.send('pong');
});

app.use('/files', require('./apps/fileApp')(fileRepository));
app.use('/accounts', require('./apps/accountApp')(accountRepository, planRepository));
app.use('/plans', require('./apps/planApp')(planRepository));

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
