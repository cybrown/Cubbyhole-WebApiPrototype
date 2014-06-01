var fs = require('fs');
var crypto = require('crypto');
var Q = require('q');
var Sha1Stream = require('./Sha1Stream');

var FileDataManager = function (filesDir, fileRepository) {
    this.filesDir = filesDir;
    this.fileRepository = fileRepository;
};

FileDataManager.prototype.write = function (file, inputStream) {
    var _this = this;
    var filename = crypto.randomBytes(4).readUInt32LE(0);
    var output = fs.createWriteStream(this.filesDir + filename);
    var sha1Stream = new Sha1Stream();
    inputStream.on('end', function () {
        var sha1 = sha1Stream.digest('hex');
        file.url = sha1;
        file.mdate = new Date();
        _this.fileRepository.save(file).done();
        fs.rename(_this.filesDir + filename, _this.filesDir + sha1, function (err) {
            if (err) {
                // TODO Throw error correctly
                throw err;
            }
        });
    });
    inputStream.pipe(sha1Stream).pipe(output);
};

FileDataManager.prototype.read = function (file) {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        if (file.url) {
            fs.exists(_this.filesDir + file.url, function (exists) {
                if (exists) {
                    resolve(fs.createReadStream(_this.filesDir + file.url));
                } else {
                    reject(new Error('File content not found'));
                }
            });
        } else {
            reject(new Error('File content not found'));
        }
    });
};

module.exports = FileDataManager;
