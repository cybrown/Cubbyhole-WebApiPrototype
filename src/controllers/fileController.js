var express = require('express');
var Q = require('q');
var readableRandom = require('readable-random');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var Ensure = CoreDecorators.Ensure;
var MinLevel = CoreDecorators.MinLevel;
var Default = CoreDecorators.Default;

module.exports = function (fileRepository, filesDir, accountRepository, shareRepository) {

    var can = function (account, permission, file) {
        if (file.owner === account.id) {
            return Q(true);
        } else {
            return shareRepository.findByFileAndAccountAndPermission(file.id, account.id, permission).then(function (perms) {
                return perms && (perms.length === 1);
            });
        }
    };

    var canHttp = function (account, permission, file) {
        return can(account, permission, file).then(function (ok) {
            if (!ok) {
                var err = new Error('Not authorized');
                err.status = 403;
                throw err;
            }
            return ok;
        });
    };

    return express()
        .get('/', Decorate(
                ExpressRequest(),
                function ($req) {
                    return fileRepository.findByParentId($req.user.home);
                })
        )
        .get('/:file', Decorate(
                ExpressRequest(),
                MinLevel(10),
                Convert('file', fileRepository.find.bind(fileRepository)),
                function (file, $req) {
                    return canHttp($req.user, 'READ', file).then(function () {
                        return file;
                    });
                })
        )
        .get('/:file/list', Decorate(
            ExpressRequest(),
            MinLevel(10),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file) {
                if (!file.isFolder) {
                    var err = new Error('Not a folder');
                    err.status = 400;
                    throw err;
                }
                return fileRepository.findByParentId(file.id);
            }
        ))
        .put('/', Decorate(
            ExpressRequest(['name', 'parent', '?isFolder']),
            Default('isFolder', false),
            Ensure('isFolder', 'boolean'),
            Ensure('parent', 'number'),
            function (name, parent, isFolder, $req) {
                var file = {};
                file.name = name;
                file.parent = parent || $req.user.home;
                file.isFolder = isFolder;
                file.owner = $req.user.id;
                return fileRepository.save(file).then(function () {
                    return file;
                });
            }
        ))
        .post('/:id', function (req, res) {
            Q.when(fileRepository.find(req.params.id), function (selectedFile) {
                if (selectedFile) {
                    var fileToModify = selectedFile;
                    if (req.query.hasOwnProperty('copy') && req.query.copy == 'true') {
                        fileToModify = {};
                        fileToModify.name = selectedFile.name,
                        fileToModify.parent = selectedFile.parent,
                        fileToModify.isFolder = selectedFile.isFolder,
                        fileToModify.owner = selectedFile.owner,
                        fileToModify.size = selectedFile.size,
                        fileToModify.url = selectedFile.url
                    }

                    if (req.body.hasOwnProperty('parent')) {
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
        })
        .delete('/:file', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file) {
                return fileRepository.removeRec(file).then(function () {});
            })
        )
        .get('/:file/raw', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                return canHttp($req.user, 'READ', file).then(function () {
                    return Q.promise(function (resolve, reject) {
                        var fs = require('fs');
                        if (file.url) {
                            fs.exists(filesDir + file.url, function (exists) {
                                if (exists) {
                                    resolve(fs.createReadStream(filesDir + file.url));
                                    return;
                                } else {
                                    var err = new Error();
                                    err.status = 404;
                                    throw err;
                                }
                            });
                        } else {
                            var err = new Error();
                            err.status = 404;
                            throw err;
                        }
                    });
                });
            }
        ))
        .put('/:file/raw', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                var fs = require('fs');
                var crypto = require('crypto');
                var Sha1Stream = require('../libs/Sha1Stream');

                var filename = crypto.randomBytes(4).readUInt32LE(0);
                var output = fs.createWriteStream(filesDir + filename);
                var sha1Stream = new Sha1Stream();

                $req.on('end', function () {
                    var sha1 = sha1Stream.digest('hex');
                    file.url = sha1;
                    file.mdate = new Date();
                    fileRepository.save(file).done();
                    fs.rename(filesDir + filename, filesDir + sha1, function (err) {
                        if (err) {
                            // TODO Throw error correctly
                            throw err;
                        }
                    });
                });
                $req.pipe(sha1Stream).pipe(output);
            }
        ))
        .get('/:file/link', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                if (file.owner !== $req.user.id) {
                    var err = new Error('Not authorized');
                    err.status = 403;
                    throw err;
                }
                if (file.isFolder) {
                    var err = new Error('Not applicable to folders');
                    err.status = 400;
                    throw err;
                }
                if (file.permalink) {
                    return file.permalink;
                } else {
                    file.permalink = readableRandom.getString(10);
                    return fileRepository.save(file).then(function () {
                        return file.permalink;
                    });
                }
            }
        ))
        .put('/:file/shares/:permission', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            Convert('account', accountRepository.find.bind(accountRepository)),
            function (file, $req, account, permission) {
                if (file.owner !== $req.user.id) {
                    var err = new Error('Not authorized');
                    err.status = 403;
                    throw err;
                }
                var share = {
                    file: file.id,
                    account: account.id,
                    permission: permission
                };
                return shareRepository.findByFileAndAccountAndPermission(file.id, account.id, permission).then(function (res) {
                    if (!res.length) {
                        return shareRepository.save(share);
                    }
                    return null;
                }).then(function () {
                    return share;
                });
            }
        ))
        .get('/:file/shares', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                return canHttp($req.user, 'PERM', file).then(function () {
                    return shareRepository.findByFile(file.id);
                });
            }
        ))
        .delete('/:file/shares/:permission', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            Convert('account', accountRepository.find.bind(accountRepository)),
            function (file, $req, account, permission) {
                return shareRepository.deleteByFileAndAccountAndPermission(file.id, account.id, permission).then(function () {
                    return;
                });
            }
        ));
};
