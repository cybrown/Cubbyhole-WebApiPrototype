var AccountRepository = module.exports = function () {
    this.entries = [];
    this.lastId = 0;
};

AccountRepository.prototype.find = function (id) {
    for (var i = 0; i < this.entries.length; i++) {
        if (this.entries[i].id == id) {
            return this.entries[i];
        }
    }
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
