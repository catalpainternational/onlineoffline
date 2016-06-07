###
  PersonStore: Provides add, edit, remove model functionality through the RequestStore
###

modelName = 'person'
appName = 'contactlist'
shelfName = "#{ appName }-#{ modelName }"

window.PersonStore = (persons) ->

  riot.observable this
  self = this
  self.persons = persons || []
  self.edit = {} # Store the Person currently being edited

  self.on 'persons_reload_from_server_done', (data, textStatus, jqXHR) ->
    self.persons = data.results
    self.trigger 'persons_changed', self.persons
    return


  ### Request the latest person list from DRF ###
  self.on 'reload_from_server', ->
    request =
      'url': "/#{ appName }/api/#{ modelName }/?format=json"
      'method': 'GET'
      'data': ''
      'status': 0
      'done': 'persons_reload_from_server_done'
      'action': 'immediate' # See RequestStore implementation: this indicates "do not cache me"

    RiotControl.trigger 'request_add', request


  ### Save the current state of persons to localStorage ###
  self.on 'shelve_persons', ->
    localStorage.setItem shelfName, JSON.stringify(self.persons)

  ### Load the current state of persons saved in localStorage ###
  self.on 'unshelve_persons', ->
    self.persons = JSON.parse(localStorage.getItem(shelfName)) or []

  self.on 'person_init', ->
    self.trigger 'persons_changed', self.persons


  self.on 'person_add_done', (data, textStatus, jqXHR) ->
    self.persons.push data
    self.trigger 'persons_changed', self.persons


  self.on 'person_add', (newPerson) ->
    RiotControl.trigger 'model_add', newPerson, 'contactlist', 'person', 'person_add_done'
    # TODO: Indicate that this person is not actually on the server until we call request.do() on the request created
    # self.persons.push(newPerson);


  self.on 'person_remove_done', (data, textStatus, jqXHR, request) ->
    i = self.persons.length - 1
    while i >= 0
      if self.persons[i].id == request.modelPk
        self.persons.splice i, 1
        self.trigger 'persons_changed', self.persons
      i--


  self.on 'person_remove', (e) ->
    RiotControl.trigger 'model_remove', appName, modelName, e.item.id, 'person_remove_done'


  self.on 'person_edit_done', (data, textStatus, jqXHR, request) ->
    i = self.persons.length - 1
    while i >= 0
      if self.persons[i].id == request.modelPk
        self.persons[i] = data
      self.trigger 'persons_changed', self.persons
      i--

  self.on 'person_edit', (e, item) ->
    form = $(e.currentTarget)
    obj = {}
    # Derive a JSON payload for our request from the form
    $.map form.find('input, textarea').not('[name=csrfmiddlewaretoken],[type=submit]'), (n, i) ->
      obj[n.name] = $(n).val()
    newPerson = JSON.stringify(obj)
    ### Trigger a model_update from RequestStore to post this, or cache it ###
    RiotControl.trigger 'model_update', newPerson, appName, modelName, item.id, 'person_edit_done'