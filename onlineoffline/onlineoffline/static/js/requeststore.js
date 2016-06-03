function RequestStore(requests) {
    // Holds details of an AJAX request: provides a local history of changes which we submit to the server
    riot.observable(this);
    var self = this;
    self.requests = requests; // Make this load from the server or from local storage

    self.on('request_add', function (url, method, data) {
        self.requests.push({'url':url, 'method':method, 'data':data, 'status':'waiting'});
        self.trigger('requests_changed', self.requests)
    });

    self.on('request_update', function (e, item, xhr) {
        self.requests.status = xhr.status;
        self.trigger('requests_changed', self.requests)
    });

}