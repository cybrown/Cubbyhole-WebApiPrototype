var Q = require('q');

var PlanRepository = module.exports = function () {
    this.entries = [];
    this.lastId = 0;
};

PlanRepository.prototype.find = function (id) {
    var _this = this;
    return Q.promise(function (resolve) {
        for (var i = 0; i < _this.entries.length; i++) {
            if (_this.entries[i].id == id) {
                resolve(_this.entries[i]);
                return;
            }
        }
        throw new Error('plan not found');
    });
};

PlanRepository.prototype.findAll = function () {
    return this.entries;
};

PlanRepository.prototype.remove = function (plan) {
    for (var i = 0; i < this.entries.length; i++) {
        if (this.entries[i].id == plan.id) {
            this.entries.splice(i, 1);
        }
    }
};

PlanRepository.prototype.save = function (plan) {
    if (!plan.id) {
        plan.id = this.lastId++;
    }
    this.entries.push(plan);
};
