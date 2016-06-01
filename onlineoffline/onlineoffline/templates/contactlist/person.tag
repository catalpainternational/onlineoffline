{% load i18n %}
<person>
<div class="col col-lg-4"
  <h3>{ message } <label class='badge'>{ persons.length }</label></h3>

  {#  This could be a crispyform or similar   #}
  <form onsubmit={ add }>
    <input name="input" onkeyup={ edit } size='60'>
    <button class="btn" disabled={ !text }>{% trans 'Add' %}</button>
    <div>characters left: { max_length - counter }</div>
  </form>

  <ul>
    <li each={ persons }>
      <div class="panel panel-default">
        <div class="panel-body">
          <h4> { name }</h4>
          <p>E { email }</p>
          <p>P { phone }</p>
        </div>
      </div>
    </li>
  </ul>
  <style scoped>

    :scope { font-size: 2rem }
    h3 { color: #444 }
    ul { font-size: 1rem }
    li { list-style-type: none }
  </style>

  var self = this
  self.message = 'Persons'
  self.counter = 0
  self.max_length = 256

  self.on('mount', function() {
    // Trigger init event when component is mounted to page.
    // Any store could respond to this.
    RiotControl.trigger('person_init')
  })

  // Register a listener for store change events.
  RiotControl.on('persons_changed', function(persons) {
    self.persons = persons
    self.update()
  })

  edit(e) {
    self.text = e.target.value
    self.counter = self.text.length
  }

  add(e) {
    if (self.text) {
      // Trigger event to all stores registered in central dispatch.
      // This allows loosely coupled stores/components to react to same events.
      RiotControl.trigger('person_add', { 'person': self.text })

      self.text = self.input.value = ''
    }
  }
</person>
