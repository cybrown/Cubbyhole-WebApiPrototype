var GenericRepository = require('./GenericRepository');

var AccountRepository = module.exports = function () {
    GenericRepository.call(this);
};
AccountRepository.prototype = Object.create(GenericRepository.prototype);

AccountRepository.prototype.objectToHash = function (object) {
    return {
        id: object.id,
        username: object.username,
        password: object.password,
        plan_id: object.plan,
        level: object.level
    };
};

AccountRepository.prototype.hashToObject = function (hash) {
    return {
        id: hash.id,
        username: hash.username,
        password: hash.password,
        plan: hash.plan_id,
        level: hash.level
    };
};

AccountRepository.prototype.findByUsernameAndPassword = function (username, password) {
    var _this = this;
    return this.sql.querySelectBy2('username', username, 'password', password).then(function (result) {
        if (!result.length) {
            throw new Error('Account not found');
        }
        return _this.hashToObject(result[0]);
    });
};
