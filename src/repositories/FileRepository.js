var FileRepository = module.exports = function () {
    this.sql = null;
};

FileRepository.objectToHash = function (file) {
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

FileRepository.hashToObject = function (hash) {
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

FileRepository.prototype.find = function (id) {
    return this.sql.querySelectById(id).then(function (result) {
        if (!result.length) {
            throw new Error('File not found');
        } else {
            return FileRepository.hashToObject(result[0]);
        }
    });
};

FileRepository.prototype.findByParentId = function (parentId) {
    return this.sql.querySelectBy('parent_id', parentId).then(function (result) {
        return result.map(FileRepository.hashToObject);
    });
};

FileRepository.prototype.remove = function (file) {
    return this.sql.queryDeleteById(file.id);
};

FileRepository.prototype.clean = function () {
    return this.sql.queryTruncate();
};

FileRepository.prototype.save = function (file) {
    if (file.id) {
        return this.sql.queryUpdateById(file.id, FileRepository.objectToHash(file));
    } else {
        return this.sql.queryInsert(FileRepository.objectToHash(file)).then(function (result) {
            file.id = result.insertId;
        });
    }
};
