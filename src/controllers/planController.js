var express = require('express');
var Decorate = require('../libs/decorate');
var CoreDecorators = require('../libs/core_decorators');
var ExpressRequest = CoreDecorators.ExpressRequest;
var Convert = CoreDecorators.Convert;
var MinLevel = CoreDecorators.MinLevel;

module.exports = function (planRepository) {
    var planController = express();

    planController.get('/', Decorate(
        ExpressRequest(),
        MinLevel(30),
        function () {
            return planRepository.findAll();
        }
    ));

    planController.get('/:plan', Decorate(
        ExpressRequest(),
        MinLevel(30),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (plan) {
            return plan;
        }
    ));

    planController.delete('/:plan', Decorate(
        ExpressRequest(),
        MinLevel(30),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (plan) {
            planRepository.remove(plan);
        }
    ));

    planController.post('/:plan', Decorate(
        ExpressRequest(['plan', '?name', '?price', '?bandwidthDownload', '?bandwidthUpload', '?space', '?shareQuota']),
        MinLevel(30),
        Convert('plan', planRepository.find.bind(planRepository)),
        function (plan, name, price, bandwidthDownload, bandwidthUpload, space, shareQuota) {
            name !== undefined && (plan.name = name);
            price !== undefined && (plan.price = price);
            bandwidthDownload !== undefined && (plan.bandwidthDownload = bandwidthDownload);
            bandwidthUpload !== undefined && (plan.bandwidthUpload = bandwidthUpload);
            space !== undefined && (plan.space = space);
            shareQuota !== undefined && (plan.shareQuota = shareQuota);
            return planRepository.save(plan).then(function () {
                return plan;
            });
        }
    ));

    planController.put('/', Decorate(
        ExpressRequest(),
        MinLevel(30),
        function(name, price, bandwidthDownload, bandwidthUpload, space, shareQuota) {
            var plan = {};
            plan.name = name;
            plan.price = price;
            plan.bandwidthDownload = bandwidthDownload;
            plan.bandwidthUpload = bandwidthUpload;
            plan.space = space;
            plan.shareQuota = shareQuota;
            return planRepository.save(plan).then(function () {
                return plan;
            });
        }
    ));

    return planController;
};
