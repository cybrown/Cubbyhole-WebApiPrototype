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
        //Ensure('parent', 'number'),
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
                        fileToModify.mdate = new Date(),
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

    return fileController;
};
