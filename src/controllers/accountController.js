var express = require('express');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var Ensure = CoreDecorators.Ensure;
var MinLevel = CoreDecorators.MinLevel;

module.exports = function (accountRepository, planRepository) {
    return express()
        .get('/', Decorate(
            ExpressRequest(),
            MinLevel(20),
            function () {
                return accountRepository.findAll();
            })
        )
        .get('/whoami', Decorate(
            ExpressRequest(),
            function ($req) {
                return $req.user;
            }
        ))
        .get('/:account', Decorate(
            ExpressRequest(),
            MinLevel(20),
            Convert('account', accountRepository.find.bind(accountRepository)),
            function (account) {
                return account;
            })
        )
        .post('/:account', Decorate(
            ExpressRequest(['account', '?username', '?password', '?plan', '?level']),
            MinLevel(20),
            Convert({account: accountRepository.find.bind(accountRepository), plan: planRepository.find.bind(planRepository)}),
            function (account, username, password, plan, level) {
                if (username !== undefined) {
                    account.username = username;
                }
                if (plan !== undefined) {
                    account.plan = plan.id;
                }
                if (level !== undefined) {
                    account.level = level;
                }
                return accountRepository.save(account).then(function () {
                    if (password !== undefined) {
                        return accountRepository.savePassword(account, password);
                    }
                    return account;
                });
            }
        ))
        .put('/', Decorate(
            ExpressRequest(),
            MinLevel(20),
            Ensure('level', 'number'),
            Convert('plan', planRepository.find.bind(planRepository)),
            function (username, password, plan, level) {
                var account = {};
                account.username = username;
                account.plan = plan.id;
                account.level = level;
                return accountRepository.findByUsernameOrDefault(account.username, null).then(function (res) {
                    if (res !== null) {
                        var err = new Error('Username not available');
                        err.status = 409;
                        throw err;
                    }
                    return accountRepository.save(account);
                }).then(function () {
                    return accountRepository.savePassword(account, password);
                });
            })
        )
        .delete('/:account', Decorate(
            ExpressRequest(),
            MinLevel(20),
            Convert('account', accountRepository.find.bind(accountRepository)),
            function (account) {
                accountRepository.remove(account);
            })
        )
        .get('/partial/starts-with/:username', Decorate(
            ExpressRequest(),
            function (username) {
                return accountRepository.findLikeUsernameAndMaxLevelLimit(username, 10, 5).then(function (accounts) {
                    return accounts.map(function (account) {
                        return {
                            id: account.id,
                            username: account.username
                        };
                    });
                });
            }
        ))
        .get('/partial/by-username/:partialAccount', Decorate(
            ExpressRequest(),
            Convert('partialAccount', accountRepository.findByUsername.bind(accountRepository)),
            function (partialAccount) {
                return {
                    id: partialAccount.id,
                    username: partialAccount.username
                };
            }
        ));
};
