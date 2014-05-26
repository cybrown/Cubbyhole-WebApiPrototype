var GenericRepository = require('./GenericRepository');

var AccountRepository = module.exports = function () {
    GenericRepository.call(this);
    this.fileRepository = null;
};
AccountRepository.prototype = Object.create(GenericRepository.prototype);

AccountRepository.prototype.objectToHash = function (object) {
    return {
        id: object.id,
        username: object.username,
        password: object.password,
        plan_id: object.plan,
        level: object.level,
        home_id: object.home
    };
};

AccountRepository.prototype.hashToObject = function (hash) {
    return {
        id: hash.id,
        username: hash.username,
        password: hash.password,
        plan: hash.plan_id,
        level: hash.level,
        home: hash.home_id
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

AccountRepository.prototype.save = function (account) {
    var _this = this;
    if (!account.id) {
        var home = {};
        home.name = 'home-' + account.username;
        home.parent = 0;
        home.isFolder = true;
        return this.fileRepository.save(home).then(function () {
            account.home = home.id;
            return GenericRepository.prototype.save.call(_this, account);
        }).then(function () {
            home.owner = account.id;
            return _this.fileRepository.save(home);
        });
    } else {
        return GenericRepository.prototype.save.call(this, account);
    }
};
