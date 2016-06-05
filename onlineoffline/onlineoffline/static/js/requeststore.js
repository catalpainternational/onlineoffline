/*
RequestStore
Provides a riotjs store to hold/inspect request information before it is passed to the server, store results afterwards
*/


function RequestStore() {

    // Holds details of an AJAX request: provides a local history of changes which we submit to the server
    riot.observable(this);
    var self = this;
    self.requests = []; // Make this load from the server or from local storage

    // Save the current state of persons to 'Lawnchair' for offline storage
    self.on('shelve_requests', function() {
        console.log('shelve_requests')
        Lawnchair({name: 'requests'}, function (store) {
            store.nuke(); // Clear all present items
            for (var indexof in self.requests) {
                var p = self.requests[indexof];
                store.save({key: p.id, data: p})
            }
        });
    });

    // Load the current state of persons saved in Lawnchair
    self.on('unshelve_requests', function(){
        console.log('unshelve_requests')
        self.requests = []; // Clear present items in the page
        Lawnchair({name:'requests'}).all(function(store){
            for (var indexof in store){
                self.requests.push(store[indexof].data)
            }
            self.trigger('requests_changed', self.requests)
        })
    });

    self.on('requests_init', function() {
        self.trigger('requests_changed', self.requests)
    });

    self.on('request_add', function (request) {
        self.requests.push({'url':request.url, 'method':request.method, 'data':request.data, 'status':'waiting', 'done':request.done, 'appName':request.appName, 'modelName':request.modelName , 'modelPk':request.modelPk});
        console.log(self.requests);
        RiotControl.trigger('requests_changed', self.requests);
    });

    self.on('request_update', function (item, xhr) {
        console.log(item);
        console.log(xhr);
        item.status = xhr.status;
        self.trigger('requests_changed', self.requests)
    });

    self.on('request_do', function(request) {

        headers = {
            'Accept': 'application/json; q=1.0, */*'
        };
        if (request.csrftoken !== undefined){
            headers['X-CSRFToken'] = request.csrftoken
        }

        var xhr = $.ajax({
            url: request.url,
            method: request.method,
            data: request.data,
            contentType: 'application/json',
            processData: false,
            headers: {

                'X-CSRFToken': request.csrftoken
            }
        }).done(function(data, textStatus, jqXHR) {
            console.log('request.do: Success')
            // Call any "success" function passed along with our xhr request
            // TODO: This is not possible to shelve! Pass a riotcontrol function name (as below) instead.
            if ($.isFunction(request.done)){
                console.warn('This will break localstorage for requests!')
                console.log(request.done)
                request.done(data, textStatus, jqXHR);
            }
            if (typeof request.done === 'string' || myVar instanceof request.done){
                RiotControl.trigger(request.done, data, textStatus, jqXHR, request);
            }
        }).always(function (data, textStatus, jqXHR) {
            console.log(data)
            console.log(textStatus)
            console.log(jqXHR)
            RiotControl.trigger('request_update', request, jqXHR);
            RiotControl.trigger('requests_changed',self.requests);
        }).fail(function(jqXHR, textStatus, errorThrown ){
            console.log('Fail')
            alert('Fail')
        })
    });

    self.on('model_add', function(modelData, appName, modelName, done) {
        var url = '/' + appName + '/api/' + modelName + '/';
        RiotControl.trigger('request_add', {
                'url': url,
                'method': 'POST',
                'data': modelData,
                'done': done
            }
        );
    });

    self.on('model_remove', function(appName, modelName , modelPk, done){
        var url = '/'+ appName+'/api/'+modelName+'/'+modelPk+'/';
        RiotControl.trigger('request_add',{
            'url': url,
            'method': 'DELETE',
            'data': '',
            'done':done,
            'modelPk':modelPk,
            'modelName':modelName,
            'appName':appName
        })
    });


    self.on('model_update', function(modelData, appName, modelName, modelPk, done){
        var url = '/' + appName + '/api/' + modelName + '/'+modelPk+'/';
        RiotControl.trigger('request_add', {
                'url': url,
                'method': 'PUT',
                'data': modelData,
                'done': done,
                'modelPk':modelPk,
                'modelName':modelName,
                'appName':appName
            }
        );
    });
}