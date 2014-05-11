var express = require('express');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var Ensure = CoreDecorators.Ensure;
var Default = CoreDecorators.Default;

module.exports = function (accountRepository, planRepository) {
    var accountController = express();

    accountController.get('/', Decorate(
        ExpressRequest(),
        function () {
            return accountRepository.findAll();
        })
    );

    accountController.get('/:account', Decorate(
        ExpressRequest(),
        Convert('account', accountRepository.find.bind(accountRepository)),
        function (account) {
            return account;
        })
    );

    accountController.post('/:account', Decorate(
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

    accountController.put('/', Decorate(
        ExpressRequest(),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (username, password, plan) {
            var account = {};
            account.username = username;
            account.password = password;
            account.plan = plan.id;
            return accountRepository.save(account).then(function () {
                return account;
            });
        })
    );

    accountController.delete('/:account', Decorate(
        ExpressRequest(),
        Convert('account', accountRepository.find.bind(accountRepository)),
        function (account) {
            accountRepository.remove(account);
        })
    );

    return accountController;
};
