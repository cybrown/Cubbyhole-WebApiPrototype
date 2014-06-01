var fs = require('fs');
var crypto = require('crypto');
var Q = require('q');
var SizeStream = require('./SizeStream');

var FileDataManager = function (filesDir, sha1StreamFactory, fileRepository) {
    this.filesDir = filesDir;
    this.fileRepository = fileRepository;
    this.sha1StreamFactory = sha1StreamFactory;
};

FileDataManager.prototype.write = function (file, inputStream) {
    var _this = this;
    return Q.promise(function (resolve, reject) {
        var filename = crypto.randomBytes(4).readUInt32LE(0);
        var output = fs.createWriteStream(_this.filesDir + filename);
        var sha1Stream = _this.sha1StreamFactory();
        var sizeStream = new SizeStream();
        inputStream.on('end', function () {
            sha1Stream.end();
            file.url = sha1Stream.read().hexSlice(0, 20);
            file.size = sizeStream.size;
            file.mdate = new Date();
            _this.fileRepository.save(file).done();
            fs.rename(_this.filesDir + filename, _this.filesDir + file.url, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(file);
                }
            });
        });
        inputStream.pipe(sha1Stream);
        inputStream.pipe(sizeStream).pipe(output);
    });
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
