###
RequestStore
  Provides a riotjs store to hold/inspect request information before it is passed to the server, and
  store results afterwards
###

window.RequestStore = ->
  # Holds details of an AJAX request: provides a local history of changes which we submit to the server
  riot.observable this
  self = this
  self.requests = []

  ### Read the current csrf token ###
  getCookie = (name) ->
    cookieValue = null
    if document.cookie and document.cookie != ''
      cookies = document.cookie.split(';')
      i = 0
      while i < cookies.length
        cookie = jQuery.trim(cookies[i])
        # Does this cookie string begin with the name we want?
        if cookie.substring(0, name.length + 1) == name + '='
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        i++
    cookieValue

  getCsrftoken = ->
    getCookie 'csrftoken'


  ### Shelve / unshelve requests to local storage to persist them through a browser restart
    TODO: Make this work with Lawnchair not just localstorage
  ###
  self.on 'shelve_requests', ->
    localStorage.setItem 'requests', JSON.stringify(self.requests)

  self.on 'unshelve_requests', ->
    self.requests = JSON.parse(localStorage.getItem('requests')) or []
    # Clear present items in the page
    RiotControl.trigger 'requests_changed', self.requests

  self.on 'requests_init', ->
    self.trigger 'requests_changed', self.requests
    return
  self.on 'request_remove', (e) ->
    i = self.requests.length - 1
    while i >= 0
      if self.requests[i] == e.item
        self.requests.splice i, 1
      i--
    RiotControl.trigger 'requests_changed', self.requests

  self.on 'request_add', (request) ->
    self.requests.push
      'url': request.url
      'method': request.method
      'data': request.data
      'status': request.status
      'done': request.done # This is  RiotControl function to call after completing the request
      'appName': request.appName
      'modelName': request.modelName
      'modelPk': request.modelPk
      'action': request.action
      'fail': request.fail || 'request_failed'
    RiotControl.trigger 'requests_changed', self.requests

  self.on 'request_update', (item, xhr) ->
    item.status = parseInt(xhr.status)
    self.trigger 'requests_changed', self.requests

  ### Attempt to send our request to the server ###
  self.on 'request_do', (request) ->
    headers =
      'Accept': 'application/json; q=1.0, */*'
      'X-CSRFToken': getCsrftoken()
    xhr = $.ajax(
      url: request.url
      method: request.method
      data: request.data
      contentType: 'application/json'
      processData: false
      headers: headers)

    ### Always update our riotjs store instance with the response code ###
    xhr.done (data, textStatus, jqXHR) ->
      # Passing a function is not suitable for storage -use a named RiotControl function instead
      if $.isFunction(request.done)
         console.error  'This will break localstorage for requests!'

         request.done data, textStatus, jqXHR
      if typeof request.done == 'string'
        RiotControl.trigger request.done, data, textStatus, jqXHR, request

    ### Always update our riotjs store instance with the response code ###
    xhr.always (data, textStatus, jqXHR) ->
      RiotControl.trigger 'request_update', request, jqXHR
      RiotControl.trigger 'requests_changed', self.requests

    xhr.fail (jqXHR, textStatus, errorThrown) ->
      RiotControl.trigger request.fail, request, jqXHR, textStatus, errorThrown


  ### Adding a new model to the DRF ###
  self.on 'model_add', (modelData, appName, modelName, done) ->
    url = '/' + appName + '/api/' + modelName + '/'
    RiotControl.trigger 'request_add',
      'url': url
      'method': 'POST'
      'data': modelData
      'done': done


  ### Prepare a request to delete a model instance through DRF  ###
  self.on 'model_remove', (appName, modelName, modelPk, done) ->
    url = '/' + appName + '/api/' + modelName + '/' + modelPk + '/'
    RiotControl.trigger 'request_add',
      'url': url
      'method': 'DELETE'
      'data': ''
      'done': done
      'modelPk': modelPk
      'modelName': modelName
      'appName': appName


  ### Prepare a request to update a model instance through DRF ###
  self.on 'model_update', (modelData, appName, modelName, modelPk, done, opts) ->
    url = '/' + appName + '/api/' + modelName + '/' + modelPk + '/'
    RiotControl.trigger 'request_add',
      'url': url
      'method': 'PUT'
      'data': modelData
      'done': done
      'modelPk': modelPk
      'modelName': modelName
      'appName': appName