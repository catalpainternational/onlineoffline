

function PersonStore(persons) {
  riot.observable(this); // Riot provides our event emitter.
  var self = this;
  self.persons = persons; // From Django context provided in the template
  self.persons = []; // Let's start fresh
  self.edit={};

    // Request the latest person list from DRF
  self.on('reload_from_server', function(){
      xhr = $.get('/contactlist/api/person/?format=json')
      xhr.success(function(result) {
          self.persons = result.results;
          self.trigger('persons_changed', self.persons)
      })
  });

  // Sae the current state of persons to 'Lawnchair' for offline storage
  self.on('save_to_local', function() {
      Lawnchair({name: 'persons'}, function (store) {
          store.nuke(); // Clear all present items
          for (var indexof in self.persons) {
              p = persons[indexof]
              store.save({key: p.id, data: p})
          }
      });
    })

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

  self.on('person_add', function(newPerson) {
      $.post('/contactlist/api/person/', newPerson, function(result) {
        self.persons.push(result);
        self.trigger('persons_changed', self.persons)
    })
  });

  self.on('person_init', function() {
    self.trigger('persons_changed', self.persons)
  });

  self.on('person_remove', function(e) {
      console.log(e)
      var form = $(e.currentTarget);
      var xhr = $.ajax({
          url: form.attr('action'),
          method: form.attr('method'),
          data: '',
          contentType: 'application/json',
          processData: false,
          headers: {
              'Accept': 'application/json; q=1.0, */*',
              'X-CSRFToken':form.find('[name=csrfmiddlewaretoken]').val()
          }
        });

    console.log(xhr);
    xhr.success(function(result) {
        self.persons.splice(self.persons.indexOf(e.item),1);
        self.trigger('persons_changed', self.persons);
        self.edit = {};
    })
    self.trigger('persons_changed', self.persons)
  });

  self.on('person_edit', function(e, item) {

    var form = $(e.currentTarget);
    var obj = {};
    $.map(form.find('input, textarea').not('[name=csrfmiddlewaretoken],[type=submit]'), function(n, i)
        {
            obj[n.name] = $(n).val();
        });

    var xhr = $.ajax({
          url: form.attr('action'),
          method: form.attr('method') || 'POST',
          data: JSON.stringify(obj),
          contentType: 'application/json',
          processData: false,
          headers: {
              'Accept': 'application/json; q=1.0, */*',
              'X-CSRFToken':form.find('[name=csrfmiddlewaretoken]').val()
          }
        });

    xhr.success(function(result) {
        self.persons[self.persons.indexOf(item)] = result
        self.trigger('persons_changed', self.persons);
        self.trigger('person_edit_hide');

    })
  });
}

