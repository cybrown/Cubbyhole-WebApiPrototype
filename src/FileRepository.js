var Q = require('q');

var FileRepository = module.exports = function () {
    this.entries = [];
};

FileRepository.prototype.find = function (id) {
    var _this = this;
    return Q.promise(function (resolve) {
        for (var i = 0; i < _this.entries.length; i++) {
            if (_this.entries[i].id == id) {
                resolve(_this.entries[i]);
                return;
            }
        }
        throw new Error('File not found');
    });
};

FileRepository.prototype.findByParentId = function (parentId) {
    var _this = this;
    return Q.promise(function (resolve) {
        resolve(_this.entries.filter(function (file) {
            return file.parent == parentId;
        }));
    });
};

FileRepository.prototype.remove = function (file) {
    var _this = this;
    return Q.promise(function (resolve) {
        var index = -1;
        for (var i = 0; i < _this.entries.length; i++) {
            if (_this.entries[i].id == file.id) {
                index = i;
                break;
            }
        }
        if (index >= 0) {
            _this.entries.splice(index, 1);
        }
        resolve();
    });
};

FileRepository.prototype.save = function (file) {
    var _this = this;
    return Q.promise(function (resolve) {
        if (!file.id) {
            file.id = _this.lastId++;
        }
        _this.entries.push(file);
    });
};
