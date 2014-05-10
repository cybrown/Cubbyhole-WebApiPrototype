var PlanRepository = module.exports = function () {
    this.sql = null;
};

PlanRepository.objectToHash = function (plan) {
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

PlanRepository.hashToObject = function (hash) {
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

PlanRepository.prototype.find = function (id) {
    return this.sql.querySelectById(id).then(function (result) {
        if (!result.length) {
            throw new Error('Plan not found');
        } else {
            return PlanRepository.hashToObject(result[0]);
        }
    });
};

PlanRepository.prototype.findAll = function () {
    return this.sql.querySelectAll().then(function (result) {
        return result.map(PlanRepository.hashToObject);
    });
};

PlanRepository.prototype.remove = function (plan) {
    return this.sql.queryDeleteById(plan.id);
};

PlanRepository.prototype.clean = function () {
    return this.sql.queryTruncate();
};

PlanRepository.prototype.save = function (plan) {
    if (plan.id) {
        return this.sql.queryUpdateById(plan.id, PlanRepository.objectToHash(plan));
    } else {
        return this.sql.queryInsert(PlanRepository.objectToHash(plan)).then(function (result) {
            plan.id = result.insertId;
        }).catch(function (err) {
            console.log(err);
        });
    }
};
