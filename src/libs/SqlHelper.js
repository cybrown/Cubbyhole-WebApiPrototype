var Q = require('q');

var SqlHelper = module.exports = function () {
    this.connection = null;
    this.PK_NAME = '';
    this.TABLE_NAME = '';
    this.TABLE_FIELDS = [];
};

// Raw sql queries

SqlHelper.QUERY_INSERT = 'INSERT INTO ?? SET ?';
SqlHelper.QUERY_UPDATE = 'UPDATE ?? SET ? WHERE ?? = ?';
SqlHelper.QUERY_SELECT_BY = 'SELECT ??, ?? FROM ?? WHERE ?? = ?';
SqlHelper.QUERY_DELETE_BY = 'DELETE FROM ?? WHERE ?? = ?';
SqlHelper.QUERY_TRUNCATE = 'TRUNCATE ??';

// Sql query wrappers

SqlHelper.prototype.querySelectBy = function (foreignKey, id) {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        _this.connection.query(SqlHelper.QUERY_SELECT_BY, [_this.PK_NAME, _this.TABLE_FIELDS, _this.TABLE_NAME, foreignKey, id], function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

SqlHelper.prototype.queryInsert = function (hash) {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        _this.connection.query(SqlHelper.QUERY_INSERT, [_this.TABLE_NAME, hash], function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

SqlHelper.prototype.queryUpdateBy = function (col_name, col_value, hash) {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        _this.connection.query(SqlHelper.QUERY_UPDATE, [_this.TABLE_NAME, hash, col_name, col_value], function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

SqlHelper.prototype.queryDeleteBy = function (col_name, col_value) {
    var _this = this;
    return Q.promise(function (resolve) {
        _this.connection.query(SqlHelper.QUERY_DELETE_BY, [_this.TABLE_NAME, col_name, col_value], function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

SqlHelper.prototype.queryTruncate = function () {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        _this.connection.query(SqlHelper.QUERY_TRUNCATE, [_this.TABLE_NAME], function (err, result) {
            err ? reject(err) : resolve(result);
        });
    });
};

// Convenience methods

SqlHelper.prototype.querySelectById = function (col_value) {
    return this.querySelectBy(this.PK_NAME, col_value);
};

SqlHelper.prototype.queryUpdateById = function (col_value, hash) {
    return this.queryUpdateBy(this.PK_NAME, col_value, hash);
};

SqlHelper.prototype.queryDeleteById = function (col_value) {
    return this.queryDeleteBy(this.PK_NAME, col_value);
};
