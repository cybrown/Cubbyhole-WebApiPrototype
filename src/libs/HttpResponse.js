var HttpResponse = module.exports = function (status, body) {
    if (typeof status === 'number') {
        this.status = status;
        this.body = body;
    } else {
        this.status = 200;
        this.body = status;
    }
    this.headers = {} ;
};
