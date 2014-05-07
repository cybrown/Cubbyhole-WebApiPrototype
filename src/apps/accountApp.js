var express = require('express');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var Ensure = CoreDecorators.Ensure;
var Default = CoreDecorators.Default;

module.exports = function (accountRepository, planRepository) {
    var accountApp = express();

    accountApp.get('/', Decorate(
        ExpressRequest(),
        function () {
            return accountRepository.findAll();
        })
    );

    accountApp.get('/:account', Decorate(
        ExpressRequest(),
        Convert('account', accountRepository.find.bind(accountRepository)),
        function (account) {
            return account;
        })
    );

    accountApp.post('/:account', Decorate(
        ExpressRequest(['account', '?username', '?password', '?plan']),
        Convert({account: accountRepository.find.bind(accountRepository), plan: planRepository.find.bind(planRepository)}),
        function (account, username, password, plan) {
            if (username !== undefined) {
                account.username = username;
            }
            if (password !== undefined) {
                account.password = password;
            }
            if (plan !== undefined) {
                account.plan = plan.id;
            }
            return account;
        }
    ));

    accountApp.put('/', Decorate(
        ExpressRequest(),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (username, password, plan) {
            var account = {};
            account.username = username;
            account.password = password;
            account.plan = plan.id;
            accountRepository.save(account);
            return account;
        })
    );

    accountApp.delete('/:account', Decorate(
        ExpressRequest(),
        Convert('account', accountRepository.find.bind(accountRepository)),
        function (account) {
            accountRepository.remove(account);
        })
    );

    return accountApp;
};
