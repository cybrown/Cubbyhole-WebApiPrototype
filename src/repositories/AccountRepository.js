var AccountRepository = module.exports = function () {
    this.sql = null;
};

AccountRepository.objectToHash = function (object) {
    return {
        id: object.id,
        username: object.username,
        password: object.password,
        plan_id: object.plan
    };
};

AccountRepository.hashToObject = function (hash) {
    return {
        id: hash.id,
        username: hash.username,
        password: hash.password,
        plan: hash.plan_id
    };
};

AccountRepository.prototype.find = function (id) {
    return this.sql.querySelectById(id).then(function (result) {
        if (!result.length) {
            throw new Error('Account not found');
        }
        return AccountRepository.hashToObject(result[0]);
    });
};

AccountRepository.prototype.clean = function () {
    return this.sql.queryTruncate();
};

AccountRepository.prototype.findAll = function () {
    return this.sql.querySelectAll().then(function (result) {
        return result.map(AccountRepository.hashToObject);
    });
};

AccountRepository.prototype.remove = function (account) {
    return this.sql.queryDeleteById(account.id);
};

AccountRepository.prototype.save = function (account) {
    if (account.id) {
        return this.sql.queryUpdateById(account.id, AccountRepository.objectToHash(account));
    } else {
        return this.sql.queryInsert(AccountRepository.objectToHash(account)).then(function (result) {
            account.id = result.insertId;
        });
    }
};
