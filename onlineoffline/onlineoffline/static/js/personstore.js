function PersonStore(persons) {

    riot.observable(this); // Riot provides our event emitter.

    var modelName = 'person'; // Used to generate URLs for our API
    var appName = 'contactlist';

    var self = this;
    self.persons = persons; // From Django context provided in the template
    self.edit={}; // Store the Person currently being edited

    // Request the latest person list from DRF
    self.on('reload_from_server', function(){
        var request = {
            'url': '/contactlist/api/person/?format=json',
            'method': 'GET',
            'data': '',
            'status': 'waiting',
            'done': function (data, textStatus, jqXHR) {
                self.persons = data.results;
                console.log(self.persons);
                self.trigger('persons_changed', self.persons)
            }
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

    self.on('person_add', function(newPerson) {

        var done = function(data, textStatus, jqXHR){
            console.log(data)
            self.persons.push(data);
            self.trigger('persons_changed', self.persons)
        };

        RiotControl.trigger('model_add', newPerson, 'contactlist', 'person', done);
        // TODO: Indicate that this person is not actually on the server until we call request.do() on the request created
        // self.persons.push(newPerson);
    });

    self.on('person_remove', function(e) {

        var modelPk = e.item.id;
        var done =  function (xhr) {
            self.persons.splice(self.persons.indexOf(e.item), 1);
            self.trigger('persons_changed', self.persons);
            self.edit = {};
        };

        RiotControl.trigger('model_remove', appName, modelName, modelPk, done)
    });

    self.on('person_edit', function(e, item) {

        var form = $(e.currentTarget);
        var obj = {};
        // Derive a JSON payload fpr our request from the form
        $.map(form.find('input, textarea').not('[name=csrfmiddlewaretoken],[type=submit]'), function(n, i)
        {
            obj[n.name] = $(n).val();
        });
        var newPerson = JSON.stringify(obj);
        var done = function (data, textStatus, jqXHR) {
            // Replace "person" record with the returned data
            self.persons[self.persons.indexOf(item)] = data.result;
            self.trigger('persons_changed', self.persons);
            self.trigger('person_edit_hide')
        };

        RiotControl.trigger('model_update', newPerson, 'contactlist', 'person', item.id, done);

    })
}

