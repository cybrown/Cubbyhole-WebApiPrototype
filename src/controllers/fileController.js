var fs = require('fs');
var express = require('express');
var Q = require('q');
var readableRandom = require('readable-random');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var HttpResponse = require('../libs/HttpResponse');
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
                        return canHttp($req.user, 'WRITE', parentFile);
                    }).then(function () {
                        return fileRepository.save(file);
                    });
                });
            }
        ))
        .post('/:file', Decorate(
            ExpressRequest(['file', '?name', '?parent']),
            Ensure('parent', 'number'),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, name, parent, $req) {
                return canHttp($req.user, 'WRITE', file).then(function () {
                    name && (file.name = name);
                    if (parent !== undefined) {
                        file.parent = (parent === 0 ? $req.user.home : parent);
                    }
                    return fileRepository.findOrDefault(file.parent, null);
                }).then(function (parentFile) {
                    if (parentFile) {
                        return canHttp($req.user, 'WRITE', parentFile);
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
            function (file, name, parent, $req) {
                var fileToSave = {};
                return canHttp($req.user, 'READ', file).then(function () {
                    fileToSave.name = file.name;
                    fileToSave.parent = file.parent;
                    fileToSave.isFolder = file.isFolder;
                    fileToSave.owner = file.owner;
                    fileToSave.size = file.size;
                    fileToSave.url = file.url;
                    name && (fileToSave.name = name);
                    parent && (fileToSave.parent = parent);
                    fileToSave.parent = fileToSave.parent === 0 ? $req.user.home : fileToSave.parent;
                    return fileRepository.find(fileToSave.parent);
                }).then(function (parentFile) {
                    canHttp($req.user, 'WRITE', parentFile);
                }).then(function () {
                    return fileRepository.save(fileToSave);
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
                    return fileDataManager.read(file).then(function (data) {
                        var response = new HttpResponse(data);
                        response.headers = {
                            'Content-Disposition':  'attachment; filename='+file.name,
                            'Content-type': file.mimetype || 'application/octet-stream'
                        };
                        return response;
                    }).catch(function (err) {
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
                    file.mimetype = $req.header('Content-type');
                    return fileRepository.save(file);
                }).then(function () {
                    return fileDataManager.write(file, $req);
                });
            }
        ))
        .post('/:file/raw', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            function (file, $req) {
                var files = null;
                return canHttp($req.user, 'WRITE', file).then(function () {
                    files = $req.files;
                    file.mimetype = files.content.type;
                    return fileRepository.save(file);
                }).then(function () {
                    return fileDataManager.write(file, fs.createReadStream(files.content.path));
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
                        } else {
                            return null;
                        }
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
        .delete('/:file/shares/:share', Decorate(
            ExpressRequest(),
            Convert('file', fileRepository.find.bind(fileRepository)),
            Convert('share', shareRepository.find.bind(shareRepository)),
            function (file, share, $req) {
                return canHttp($req.user, 'PERM', file).then(function () {
                    return shareRepository.remove(share);
                }).then(function () {

                });
            }
        ));
};
