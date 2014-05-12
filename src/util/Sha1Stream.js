var crypto = require('crypto');
var stream = require('stream');

var Sha1Stream = module.exports = function () {
    stream.Transform.call(this);
    this.shasum = crypto.createHash('sha1');
};
Sha1Stream.prototype = Object.create(stream.Transform.prototype);

Sha1Stream.prototype._transform = function (chunk, encoding, callback) {
    this.shasum.update(chunk);
    callback(null, chunk);
};

Sha1Stream.prototype.digest = function (arg1) {
    return this.shasum.digest(arg1);
};
