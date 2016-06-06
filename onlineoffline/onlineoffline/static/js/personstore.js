function PersonStore(persons) {

    riot.observable(this); // Riot provides our event emitter.

    var modelName = 'person'; // Used to generate URLs for our API
    var appName = 'contactlist';

    var self = this;
    self.persons = persons; // From Django context provided in the template
    self.edit={}; // Store the Person currently being edited


    self.on('persons_reload_from_server_done', function(data, textStatus, jqXHR) {
        self.persons = data.results;
        self.trigger('persons_changed', self.persons)
    })

    // Request the latest person list from DRF
    self.on('reload_from_server', function(){
        var request = {
            'url': '/contactlist/api/person/?format=json',
            'method': 'GET',
            'data': '',
            'status': 'waiting',
            'done': 'persons_reload_from_server_done'
        };
        RiotControl.trigger('request_add', request);
        //RiotControl.trigger('request_do', request);
    });

    // Save the current state of persons to 'Lawnchair' for offline storage
    self.on('save_to_local', function() {
        Lawnchair({name: 'persons'}, function (store) {
            store.nuke(); // Clear all present items
            for (var indexof in self.persons) {
                var p = self.persons[indexof];
                store.save({key: p.id, data: p})
            }
        });
    });

    // Load the current state of persons saved in Lawnchair
    self.on('from_local', function(){
        self.persons = []; // Clear present items in the page
        Lawnchair({name:'persons'}).all(function(store){
            for (var indexof in store){
                self.persons.push(store[indexof].data)
            }
            self.trigger('persons_changed', self.persons)
        })
    });

    self.on('person_init', function() {
        self.trigger('persons_changed', self.persons)
    });

    self.on('person_add_done', function(data, textStatus, jqXHR) {
        self.persons.push(data);
        self.trigger('persons_changed', self.persons)
    });

    self.on('person_add', function(newPerson) {

        RiotControl.trigger('model_add', newPerson, 'contactlist', 'person', 'person_add_done');
        // TODO: Indicate that this person is not actually on the server until we call request.do() on the request created
        // self.persons.push(newPerson);
    });

    self.on('person_remove_done', function(data, textStatus, jqXHR, request){
        for(var i = self.persons.length-1; i >= 0; i--){
            if(self.persons[i].id == request.modelPk){
                self.persons.splice(i,1);
            self.trigger('persons_changed', self.persons)
            }
        }
    });

    self.on('person_remove', function(e) {
        RiotControl.trigger('model_remove', appName, modelName, e.item.id, 'person_remove_done')
    });

    self.on('person_edit_done', function(data, textStatus, jqXHR, request){
        console.log(request.modelPk)
        console.log(data)
        for(var i = self.persons.length-1; i >= 0; i--){
            console.log(i)
            console.log(self.persons[i].id)
            if(self.persons[i].id == request.modelPk){
                self.persons[i] = data;
                console.log('hit')
                console.log(data.result)

            }
            self.trigger('persons_changed', self.persons)
        }
    });

    self.on('person_edit', function(e, item) {

        var form = $(e.currentTarget);
        var obj = {};
        // Derive a JSON payload for our request from the form
        $.map(form.find('input, textarea').not('[name=csrfmiddlewaretoken],[type=submit]'), function(n, i){
            obj[n.name] = $(n).val();
        });
        var newPerson = JSON.stringify(obj);

        RiotControl.trigger('model_update', newPerson, appName, modelName, item.id, 'person_edit_done');

    })
}

