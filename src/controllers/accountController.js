var express = require('express');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var Ensure = CoreDecorators.Ensure;
var MinLevel = CoreDecorators.MinLevel;

module.exports = function (accountRepository, planRepository, fileRepository) {
    var accountController = express();

    accountController.get('/', Decorate(
        ExpressRequest(),
        MinLevel(20),
        function () {
            return accountRepository.findAll();
        })
    );

    accountController.get('/:account', Decorate(
        ExpressRequest(),
        MinLevel(20),
        Convert('account', accountRepository.find.bind(accountRepository)),
        function (account) {
            return account;
        })
    );

    accountController.post('/:account', Decorate(
        ExpressRequest(['account', '?username', '?password', '?plan', '?level']),
        MinLevel(20),
        Convert({account: accountRepository.find.bind(accountRepository), plan: planRepository.find.bind(planRepository)}),
        function (account, username, password, plan, level) {
            if (username !== undefined) {
                account.username = username;
            }
            if (password !== undefined) {
                account.password = password;
            }
            if (plan !== undefined) {
                account.plan = plan.id;
            }
            if (level !== undefined) {
                account.level = level;
            }
            return accountRepository.save(account).then(function () {
                return account;
            });
        }
    ));

    accountController.put('/', Decorate(
        ExpressRequest(),
        MinLevel(20),
        Ensure('level', 'number'),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (username, password, plan, level) {
            var account = {};
            var home = {};
            home.name = 'home-' + username;
            home.parent = 0;
            return fileRepository.save(home).then(function () {
                account.username = username;
                account.password = password;
                account.plan = plan.id;
                account.level = level;
                account.home = home.id;
                return accountRepository.save(account);
            }).then(function () {
                return account;
            });
        })
    );

    accountController.delete('/:account', Decorate(
        ExpressRequest(),
        MinLevel(20),
        Convert('account', accountRepository.find.bind(accountRepository)),
        function (account) {
            accountRepository.remove(account);
        })
    );

    return accountController;
};
