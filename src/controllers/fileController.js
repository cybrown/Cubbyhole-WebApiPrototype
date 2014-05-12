var express = require('express');
var Q = require('q');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var Ensure = CoreDecorators.Ensure;
var Default = CoreDecorators.Default;

module.exports = function (fileRepository) {

    var fileController = express();

    fileController.get('/', Decorate(
            ExpressRequest(),
            function () {
                return fileRepository.findByParentId(0);
            })
    );

    fileController.get('/:file', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file) {
                return file;
            })
    );

    fileController.put('/', Decorate(
        ExpressRequest(['name', 'parent', '?isFolder']),
        Default('isFolder', false),
        Ensure('isFolder', 'boolean'),
        Ensure('parent', 'number'),
        function (name, parent, isFolder) {
            var file = {};
            file.name = name;
            file.parent = parent;
            file.isFolder = isFolder;
            return fileRepository.save(file).then(function () {
                return file;
            });
        }
    ));

    fileController.post('/:id', function (req, res) {
        Q.when(fileRepository.find(req.params.id), function (selectedFile) {
            if (selectedFile) {
                var fileToModify = selectedFile;
                if (req.query.hasOwnProperty('copy') && req.query.copy == 'true') {
                    fileToModify = {};
                    fileToModify.name = selectedFile.name,
                    fileToModify.parent = selectedFile.parent,
                    fileToModify.isFolder = selectedFile.isFolder,
                    fileToModify.cdate = new Date(),
                    fileToModify.owner = selectedFile.owner,
                    fileToModify.size = selectedFile.size,
                    fileToModify.url = selectedFile.url
                }

                if (req.body.hasOwnProperty('file')) {
                    fileToModify.parent = Number(req.body.parent);
                }
                if (req.body.hasOwnProperty('name')) {
                    fileToModify.name = req.body.name;
                }
                fileRepository.save(fileToModify).then(function () {
                    res.json(fileToModify);
                });
            } else {
                res.status(404).send('');
            }
        });
    });

    fileController.delete('/:file', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file) {
                fileRepository.remove(file);
            })
    );

    fileController.get('/:file/raw', function (req, res) {
        fileRepository.find(req.params.file).done(function (file) {
            var fs = require('fs');

            if (file.url) {
                fs.exists('files/' + file.url, function (exists) {
                    if (exists) {
                        fs.createReadStream('files/' + file.url).pipe(res);
                    } else {
                        res.status(404).send('');
                    }
                });
            } else {
                res.status(404);
                res.send('');
            }
        }, function () {
            res.status(404).send('');
        });
    });

    fileController.put('/:file/raw', function (req, res) {
        fileRepository.find(req.params.file).done(function (file) {
            var fs = require('fs');
            var crypto = require('crypto');
            var Sha1Stream = require('../util/Sha1Stream');

            var filename = crypto.randomBytes(4).readUInt32LE(0);
            var output = fs.createWriteStream('files/' + filename);
            var sha1Stream = new Sha1Stream();

            req.on('end', function () {
                var sha1 = sha1Stream.digest('hex');
                file.url = sha1;
                fileRepository.save(file).done();
                fs.rename('files/' + filename, 'files/' + sha1, function (err) {
                    if (err) {
                        res.status(500).send('');
                    }
                    res.send('');
                });
            });
            req.pipe(sha1Stream).pipe(output);
        }, function (err) {
            res.status(404).send('');
        });
    });

    return fileController;
};
