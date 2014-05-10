var Q = require('q');

var AccountRepository = module.exports = function () {
    this.entries = [];
    this.lastId = 0;
};

AccountRepository.prototype.find = function (id) {
    var _this = this;
    return Q.promise(function (resolve) {
        for (var i = 0; i < _this.entries.length; i++) {
            if (_this.entries[i].id == id) {
                resolve (_this.entries[i]);
                return;
            }
        }
        throw new Error('Account not found');
    });
};

AccountRepository.prototype.findAll = function () {
    return this.entries;
};

AccountRepository.prototype.remove = function (account) {
    for (var i = 0; i < this.entries.length; i++) {
        if (this.entries[i].id == account.id) {
            this.entries.splice(i, 1);
        }
    }
};

AccountRepository.prototype.save = function (account) {
    if (!account.id) {
        account.id = this.lastId++;
    }
    this.entries.push(account);
};
