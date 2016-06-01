
function PersonStore(persons) {
  riot.observable(this) // Riot provides our event emitter.
  var self = this

  if (persons) {   // If we get some persons from the context use them
    self.persons = persons;
  } else {  // Otherwise use this little list of persons instead
    self.persons = [
      { person: 'Person 1',},
      { person: 'Person 2',}
    ]
  }
  

  // Our store's event handlers / API.
  // This is where we would use AJAX calls to interface with the server.
  // Any number of views can emit actions/events without knowing the specifics of the back-end.
  // This store can easily be swapped for another, while the view components remain untouched.

  self.on('person_add', function(newPerson) {
    // Post the new person to the RESTful API
    // If we are successfull add the new person to the list of persons
    // and trigger an event to let the tag update itself with the new persons
    $.post('/api/person/', newPerson, function(result) {
        self.persons.push(result)
        self.trigger('persons_changed', self.persons)
    })
  })

  self.on('person_init', function() {
    self.trigger('persons_changed', self.persons)
  })

  // The store emits change events to any listening views, so that they may react and redraw themselves.

}
