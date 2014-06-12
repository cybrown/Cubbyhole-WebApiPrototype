var GenericRepository = module.exports = function () {
    this.sql = null;
};

GenericRepository.prototype.find = function (id) {
    var _this = this;
    return this.sql.querySelectById(id).then(function (result) {
        if (!result.length) {
            throw new Error('Object not found: ' + id);
        }
        return _this.hashToObject(result[0]);
    });
};

GenericRepository.prototype.findBy = function (col_name, col_value) {
    var _this = this;
    return this.sql.querySelectBy(col_name, col_value).then(function (result) {
        if (!result.length) {
            throw new Error('Object not found: ' + col_name);
        }
        return _this.hashToObject(result[0]);
    });
};

GenericRepository.prototype.findOrDefault = function (id, def) {
    var _this = this;
    return this.sql.querySelectById(id).then(function (result) {
        if (!result.length) {
            return def;
        }
        return _this.hashToObject(result[0]);
    });
};

GenericRepository.prototype.findByOrDefault = function (col_name, col_value, def) {
    var _this = this;
    return this.sql.querySelectBy(col_name, col_value).then(function (result) {
        if (!result.length) {
            return def;
        }
        return _this.hashToObject(result[0]);
    });
};

GenericRepository.prototype.clean = function () {
    return this.sql.queryTruncate();
};

GenericRepository.prototype.remove = function (object) {
    return this.sql.queryDeleteById(object.id);
};

GenericRepository.prototype.findAll = function () {
    var _this = this;
    return this.sql.querySelectAll().then(function (result) {
        return result.map(_this.hashToObject);
    });
};

GenericRepository.prototype.save = function (object) {
    var _this = this;
    if (object.id) {
        return this.sql.queryUpdateById(object.id, this.objectToHash(object)).then(function () {
            return object;
        });
    } else {
        return this.sql.queryInsert(this.objectToHash(object)).then(function (hashResult) {
            var result = _this.hashToObject(hashResult);
            object.id = hashResult.id;
            result.id = hashResult.id;
            return result;
        });
    }
};
