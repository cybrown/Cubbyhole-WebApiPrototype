var GenericRepository = module.exports = function () {
    this.sql = null;
};

GenericRepository.prototype.find = function (id) {
    var _this = this;
    return this.sql.querySelectById(id).then(function (result) {
        if (!result.length) {
            throw new Error('Account not found');
        }
        return _this.hashToObject(result[0]);
    });
};

GenericRepository.prototype.clean = function () {
    return this.sql.queryTruncate();
};

GenericRepository.prototype.remove = function (account) {
    return this.sql.queryDeleteById(account.id);
};

GenericRepository.prototype.findAll = function () {
    var _this = this;
    return this.sql.querySelectAll().then(function (result) {
        return result.map(_this.hashToObject);
    });
};

GenericRepository.prototype.save = function (object) {
    if (object.id) {
        return this.sql.queryUpdateById(object.id, this.objectToHash(object));
    } else {
        return this.sql.queryInsert(this.objectToHash(object)).then(function (result) {
            object.id = result.insertId;
        });
    }
};
