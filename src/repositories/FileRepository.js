var Q = require('q');

var GenericRepository = require('./GenericRepository');

var FileRepository = module.exports = function () {
    GenericRepository.call(this);
};
FileRepository.prototype = Object.create(GenericRepository.prototype);

FileRepository.prototype.objectToHash = function (file) {
    return {
        id: file.id,
        name: file.name,
        parent_id: file.parent,
        isFolder: file.isFolder,
        owner_id: file.owner,
        size: file.size,
        url: file.url,
        cdate: file.cdate,
        mdate: file.mdate
    };
};

FileRepository.prototype.hashToObject = function (hash) {
    return {
        id: hash.id,
        name: hash.name,
        parent: hash.parent_id,
        isFolder: Boolean(hash.isFolder),
        owner: hash.owner_id,
        size: hash.size,
        url: hash.url,
        cdate: hash.cdate,
        mdate: hash.mdate
    };
};

FileRepository.prototype.findByParentId = function (parentId) {
    var _this = this;
    return this.sql.querySelectBy('parent_id', parentId).then(function (result) {
        return result.map(_this.hashToObject);
    });
};

FileRepository.prototype.removeByParentId = function (parentId) {
    var _this = this;
    return this.sql.queryDeleteBy('parent_id', parentId).then(function (result) {
        return result.map(_this.hashToObject);
    });
};

FileRepository.prototype.removeRec = function (file) {
    var _this = this;
    if (file.isFolder) {
        return this.findByParentId(file.id).then(function (files) {
            return Q.all(files.map(function (file) {
                return _this.removeRec(file);
            }));
        }).then(function () {
            return _this.remove(file);
        });
    } else {
        return this.remove(file);
    }
};
