var express = require('express');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var Ensure = CoreDecorators.Ensure;
var Default = CoreDecorators.Default;

module.exports = function (planRepository) {
    var planApp = express();

    planApp.get('/', Decorate(
        ExpressRequest(),
        function () {
            return planRepository.findAll();
        }
    ));

    planApp.get('/:plan', Decorate(
        ExpressRequest(),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (plan) {
            return plan;
        }
    ));

    planApp.delete('/:plan', Decorate(
        ExpressRequest(),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (plan) {
            planRepository.remove(plan);
        }
    ));

    planApp.post('/:plan', Decorate(
        ExpressRequest(['plan', '?name', '?price', '?bandwidthDownload', '?bandwidthUpload', '?space', '?shareQuota']),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (plan, name, price, bandwidthDownload, bandwidthUpload, space, shareQuota) {
            name !== undefined && (plan.name = name);
            price !== undefined && (plan.price = price);
            bandwidthDownload !== undefined && (plan.bandwidthDownload = bandwidthDownload);
            bandwidthUpload !== undefined && (plan.bandwidthUpload = bandwidthUpload);
            space !== undefined && (plan.space = space);
            shareQuota !== undefined && (plan.shareQuota = shareQuota);
            return plan;
        }
    ));

    planApp.put('/', Decorate(
        ExpressRequest(),
        function(name, price, bandwidthDownload, bandwidthUpload, space, shareQuota) {
            var plan = {};
            plan.name = name;
            plan.price = price;
            plan.bandwidthDownload = bandwidthDownload;
            plan.bandwidthUpload = bandwidthUpload;
            plan.space = space;
            plan.shareQuota = shareQuota;
            planRepository.save(plan);
            return plan;
        }
    ));

    return planApp;
};
