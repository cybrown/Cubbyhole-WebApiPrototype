var FileRepository = require('../../src/repositories/FileRepository');
var SqlHelper = require('../../src/libs/SqlHelper');
var mysql = require('mysql');

describe ('FileRepository', function () {

    var files = new FileRepository();

    var mysqlConnection = mysql.createConnection({
        host: 'localhost',
        user: 'cubbyhole',
        password: 'cubbyhole',
        database: 'cubbyhole_proto'
    });
    mysqlConnection.connect();

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

    files.sql = fileSqlHelper;

    it ('should clean file database', function (done) {
        files.clean().then(function () {
            done();
        });
    });

    it ('should get 0 files', function (done) {
        files.findByParentId(0).then(function (result) {
            result.length.should.eql(0);
            done();
        });
    });

    it ('should create a file', function (done) {
        var file = {
            name: 'ok'
        };
        files.save(file).then(function () {
            done();
        });
    });

    it ('should get a file', function (done) {
        files.find(1).then(function (file) {
            file.name.should.eql('ok');
            done();
        });
    });

    it ('should save a file', function (done) {
        files.find(1).then(function (file) {
            file.name = 'toto';
            return files.save(file);
        }).then(function () {
            return files.find(1);
        }).then(function (file) {
            file.name.should.eql('toto');
            done();
        });
    });
});
