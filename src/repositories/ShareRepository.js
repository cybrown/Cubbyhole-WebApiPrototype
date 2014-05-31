var Q = require('q');

var GenericRepository = require('./GenericRepository');

var ShareRepository = module.exports = function () {
    GenericRepository.call(this);
};
ShareRepository.prototype = Object.create(GenericRepository.prototype);

ShareRepository.prototype.objectToHash = function (share) {
    return {
        id: share.id,
        file_id: share.file,
        account_id: share.account,
        permission: share.permission
    };
};

ShareRepository.prototype.hashToObject = function (hash) {
    return {
        id: hash.id,
        file: hash.file_id,
        account: hash.account_id,
        permission: hash.permission
    };
};

ShareRepository.prototype.findByFile = function (fileId) {
    var _this = this;
    return this.sql.querySelectBy('file_id', fileId).then(function (result) {
        return result.map(_this.hashToObject);
    });
};

ShareRepository.prototype.findByFileAndAccount = function (fileId, accountId) {
    var _this = this;
    return this.sql.querySelectBy2('file_id', fileId, 'account_id', accountId).then(function (result) {
        return result.map(_this.hashToObject);
    });
};

ShareRepository.prototype.findByFileAndAccountAndPermission = function (fileId, accountId, permission) {
    var _this = this;
    return this.sql.querySelectBy3('file_id', fileId, 'account_id', accountId, 'permission', permission).then(function (result) {
        return result.map(_this.hashToObject);
    });
};

ShareRepository.prototype.deleteByFileAndAccountAndPermission = function (fileId, accountId, permission) {
    return this.sql.queryDeleteBy3('file_id', fileId, 'account_id', accountId, 'permission', permission).then(function (result) {
        return;
    });
};

ShareRepository.prototype.findFilesSharedTo = function (accountId) {
    var _this = this;
    return this.sql.querySelectBy('account_id', accountId).then(function (result) {
        return result.map(_this.hashToObject);
    });
};
