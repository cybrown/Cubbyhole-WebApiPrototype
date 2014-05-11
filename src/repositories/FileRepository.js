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
