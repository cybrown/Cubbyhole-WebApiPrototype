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

module.exports = function (fileRepository, accountRepository, shareRepository, fileDataManager) {

    var can = function (account, permission, resource) {
        if (resource.owner === account.id) {
            return Q(true);
        } else {
            return shareRepository.findByFileAndAccountAndPermission(resource.id, account.id, permission).then(function (perms) {
                return perms && (perms.length === 1);
            });
        }
    };

    var canHttp = function (account, permission, resource) {
        return can(account, permission, resource).then(function (ok) {
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
        .get('/shared', Decorate(
            ExpressRequest(),
            function($req) {
                return shareRepository.findFilesSharedTo($req.user.id).then(function (shares) {
                    return Q.all(shares.map(function (share) {
                        return fileRepository.find(share.file);
                    }));
                });
            }
        ))
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
            function (file, $req) {
                return canHttp($req.user, 'READ', file).then(function () {
                    if (!file.isFolder) {
                        var err = new Error('Not a folder');
                        err.status = 400;
                        throw err;
                    }
                    return fileRepository.findByParentId(file.id);
                });
            }
        ))
        .put('/', Decorate(
            ExpressRequest(['name', 'parent', '?isFolder']),
            Default('isFolder', false),
            Ensure('isFolder', 'boolean'),
            Ensure('parent', 'number'),
            function (name, parent, isFolder, $req) {
                if (parent === 0) {
                    parent = $req.user.home;
                }
                return fileRepository.find(parent).then(function (parentFile) {
                    return canHttp($req.user, 'WRITE', parentFile);
                }).then(function () {
                    var file = {};
                    file.name = name;
                    file.parent = parent || $req.user.home;
                    file.isFolder = isFolder;
                    file.owner = $req.user.id;
                    return fileRepository.find(file.parent).then(function (parentFile) {
                        if (parentFile.owner !== $req.user.id) {
                            var err = new Error('Not authorized');
                            err.status = 403;
                            throw err;
                        }
                        return fileRepository.save(file)
                    }).then(function () {
                        return file;
                    });
                });
            }
        ))
        .post('/:file', Decorate(
            ExpressRequest(['file', '?name', '?parent']),
            Ensure('parent', 'number'),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, name, parent, $req) {
                name && (file.name = name);
                if (parent !== undefined) {
                    file.parent = (parent === 0 ? $req.user.home : parent);
                }
                return fileRepository.findOrDefault(file.parent, null).then(function (parentFile) {
                    if (parentFile) {
                        return canHttp($req.user, 'WRITE', parentFile);
                    } else {
                        return true;
                    }
                }).then(function () {
                    return fileRepository.save(file);
                });
            }
        ))
        .post('/:file/copy', Decorate(
            ExpressRequest(['file', '?name', '?parent']),
            Ensure('parent', 'number'),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, name, parent) {
                var fileToSave = {};
                fileToSave.name = file.name;
                fileToSave.parent = file.parent;
                fileToSave.isFolder = file.isFolder;
                fileToSave.owner = file.owner;
                fileToSave.size = file.size;
                fileToSave.url = file.url;
                name && (fileToSave.name = name);
                parent && (fileToSave.parent = parent);
                return fileRepository.save(fileToSave).then(function () {
                    return fileToSave;
                });
            }
        ))
        .delete('/:file', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                return canHttp($req.user, 'DELETE', file).then(function () {
                    return fileRepository.removeRec(file);
                }).then(function () {})
            })
        )
        .get('/:file/raw', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                return canHttp($req.user, 'READ', file).then(function () {
                    return fileDataManager.read(file).catch(function (err) {
                        if (err.message.match(/not found/)) {
                            err.status = 404;
                        } else {
                            err.status = 500;
                        }
                        throw err;
                    });
                });
            }
        ))
        .put('/:file/raw', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                return canHttp($req.user, 'WRITE', file).then(function () {
                    fileDataManager.write(file, $req);
                });
            }
        ))
        .post('/:file/link', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                return canHttp($req.user, 'LINK', file).then(function () {
                    if (file.isFolder) {
                        var err = new Error('Not applicable to folders');
                        err.status = 400;
                        throw err;
                    }
                    if (file.permalink) {
                        return file;
                    } else {
                        file.permalink = readableRandom.getString(10);
                        return fileRepository.save(file).then(function () {
                            return file;
                        });
                    }
                });
            }
        ))
        .put('/:file/shares/:permission', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            Convert('account', accountRepository.find.bind(accountRepository)),
            function (file, $req, account, permission) {
                return canHttp($req.user, 'PERM', file).then(function () {
                    if (file.isFolder) {
                        var err = new Error('Can not apply share to folder');
                        err.status = 400;
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
                return canHttp($req.user, 'PERM', file).then(function () {
                    return shareRepository.deleteByFileAndAccountAndPermission(file.id, account.id, permission);
                }).then(function () {

                });
            }
        ));
};
