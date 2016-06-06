###
{% load static %}
###
CACHE_NAME = 'dependencies-cache'
REQUIRED_FILES = [
        "/service_service-worker.js",
        "{% static 'js/riot_compiler.min.js' %}"
        "{% static 'js/riotcontrol.js' %}"
        "{% static 'js/personstore.js' %}"
        "{% static 'js/requeststore.js' %}"
        "{% static 'js/jquery-2.1.4.min.js' %}"
        "{% static 'js/Lawnchair.js' %}"
        "{% static 'js/adapters/indexed-db.js' %}"
        "{% static 'css/bootstrap.min.css' %}"
]

self.addEventListener 'install', (event) ->
  # Perform install step:  loading each required file into cache
  event.waitUntil caches.open(CACHE_NAME).then((cache) ->
    # Add all offline dependencies to the cache
    console.log '[install] Caches opened, adding all core components' + 'to cache'
    cache.addAll REQUIRED_FILES
  ).then(->
    console.log '[install] All required resources have been cached, ' + 'we\'re good!'
    self.skipWaiting()
  )
  return
self.addEventListener 'fetch', (event) ->
  event.respondWith caches.match(event.request).then((response) ->
    # Cache hit - return the response from the cached version
    if response
      console.log '[fetch] Returning from ServiceWorker cache: ', event.request.url
      return response
    # Not in cache - return the result from the live server
    # `fetch` is essentially a "fallback"
    console.log '[fetch] Returning from server: ', event.request.url
    fetch event.request
  )
  return
self.addEventListener 'activate', (event) ->
  console.log '[activate] Activating ServiceWorker!'
  # Calling claim() to force a "controllerchange" event on navigator.serviceWorker
  console.log '[activate] Claiming this ServiceWorker!'
  event.waitUntil self.clients.claim()
  return
