var FileRepository = module.exports = function () {
    this.entries = [];
};

FileRepository.prototype.find = function (id) {
    var selectedFile;
    for (var i = 0; i < this.entries.length; i++) {
        if (this.entries[i].id == id) {
            selectedFile = this.entries[i];
            break;
        }
    }
    return selectedFile;
};

FileRepository.prototype.findByParentId = function (parentId) {
    return this.entries.filter(function (file) {
        return file.parent == parentId;
    });
};

FileRepository.prototype.remove = function (file) {
    var index = -1;
    for (var i = 0; i < this.entries.length; i++) {
        if (this.entries[i].id == file.id) {
            index = i;
            break;
        }
    }
    if (index >= 0) {
        this.entries.splice(index, 1);
    }
};

FileRepository.prototype.save = function (file) {
    if (!file.id) {
        file.id = this.lastId++;
    }
    this.entries.push(file);
};
