###
{% load static %}
###
CACHE_NAME = 'dependencies-cache'
REQUIRED_FILES = [
        "/contactlist/offline/",
        "/service_serviceworker.js",
        "{% static 'js/riot_compiler.min.js' %}"
        "{% static 'js/riotcontrol.js' %}"
        "{% static 'js/personstore.js' %}"
        "{% static 'js/requeststore.js' %}"
        "{% static 'js/jquery-2.1.4.min.js' %}"
        "{% static 'js/Lawnchair.js' %}"
        "{% static 'js/adapters/indexed-db.js' %}"
        "{% static 'css/bootstrap.min.css' %}"
        "{% static 'js/get_csrftoken.js' %}"
]

self.addEventListener 'install', (event) ->
  # Perform install step:  loading each required file into cache
  event.waitUntil caches.open(CACHE_NAME).then((cache) ->
    cache.addAll REQUIRED_FILES
  ).then(->
    #  console.log '[install] All required resources have been cached, ' + 'we\'re good!'
    self.skipWaiting()
  )
  return
self.addEventListener 'fetch', (event) ->
  #  Respond from the cache if the file is there, else look for the server
  event.respondWith caches.match(event.request).then((response) ->
    return response if response #  console.log '[fetch] Returning from ServiceWorker cache: ', event.request.url
    fetch event.request #  Not in cache - fallback to 'fetch' the result from the live server
  )
  return
self.addEventListener 'activate', (event) ->
  #  Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  event.waitUntil self.clients.claim()
  return
