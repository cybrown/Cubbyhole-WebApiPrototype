var GenericRepository = require('./GenericRepository');

var PlanRepository = module.exports = function () {
    GenericRepository.call(this);
};
PlanRepository.prototype = Object.create(GenericRepository.prototype);

PlanRepository.prototype.objectToHash = function (plan) {
    return {
        id: plan.id,
        name: plan.name,
        bandwidthDownload: plan.bandwidthDownload,
        bandwidthUpload: plan.bandwidthUpload,
        space: plan.space,
        price: plan.price,
        shareQuota: plan.shareQuota
    };
};

PlanRepository.prototype.hashToObject = function (hash) {
    return {
        id: hash.id,
        name: hash.name,
        bandwidthDownload: hash.bandwidthDownload,
        bandwidthUpload: hash.bandwidthUpload,
        price: hash.price,
        space: hash.space,
        shareQuota: hash.shareQuota
    };
};
