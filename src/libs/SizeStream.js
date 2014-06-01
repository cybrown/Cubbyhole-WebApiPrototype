var stream = require('stream');

var SizeStream = module.exports = function () {
    stream.Transform.call(this);
    this.size = 0;
};
SizeStream.prototype = Object.create(stream.Transform.prototype);

SizeStream.prototype._transform = function (chunk, encoding, callback) {
    this.size += chunk.length;
    callback(null, chunk);
};
