// Generated by CoffeeScript 1.10.0

/*
RequestStore
  Provides a riotjs store to hold/inspect request information before it is passed to the server, and
  store results afterwards

  Properties of a request:
  url = URL to call
  method = "GET", "POST", "PUT" or "DELETE"
  data = JSON content for the request

  The following jQuery promises can be passed (as RiotControl function names):
  always = a RiotControl function name to call whatever happens
  done = a RiotControl function name to call on success
  fail = a RiotControl function name to call on failure
 */

(function() {
  window.RequestStore = function() {
    var getCookie, getCsrftoken, self;
    riot.observable(this);
    self = this;
    self.requests = [];

    /* Read the current csrf token */
    getCookie = function(name) {
      var cookie, cookieValue, cookies, i;
      cookieValue = null;
      if (document.cookie && document.cookie !== '') {
        cookies = document.cookie.split(';');
        i = 0;
        while (i < cookies.length) {
          cookie = jQuery.trim(cookies[i]);
          if (cookie.substring(0, name.length + 1) === name + '=') {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
          i++;
        }
      }
      return cookieValue;
    };
    getCsrftoken = function() {
      return getCookie('csrftoken');
    };

    /* This is beautiful coffeescript */
    Array.prototype.removing = function(fieldname, fieldvalue) {
      var j, len, results, x;
      results = [];
      for (j = 0, len = this.length; j < len; j++) {
        x = this[j];
        if (!(x[fieldname] === fieldvalue)) {
          results.push(x);
        }
      }
      return results;
    };

    /* list.filterHighLow('status', 200, 400) -> new list where all items have 'status' property between 200 and 399 */
    Array.prototype.filterByPropertyRange = function(propertyToRead, low, high) {
      var j, len, ref, results, x;
      results = [];
      for (j = 0, len = this.length; j < len; j++) {
        x = this[j];
        if ((low <= (ref = x[propertyToRead]) && ref < high)) {
          results.push(x);
        }
      }
      return results;
    };

    /*
      list.setPropertyByPropertyRange ('status', 200, 400, 'hidden') -> new list where if "status" is between 200 and 400, hidden = true
      otherwise hidden is set to false
     */
    self.setPropertyByPropertyRange = function(propertyToRead, low, high, propertyToSet, inverse) {
      var j, len, ref, ref1, ref2, x;
      console.log(propertyToRead + ", " + low + "," + high + ", " + propertyToSet + ", " + inverse);
      ref = self.requests;
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        if (inverse === 'false') {
          x[propertyToSet] = (low <= (ref1 = x[propertyToRead]) && ref1 < high) ? false : true;
        } else {
          x[propertyToSet] = (low <= (ref2 = x[propertyToRead]) && ref2 < high) ? true : false;
        }
      }
      return false;
    };

    /*
      filterByPropertyValue ('method', 'PUT', 'filter_by_method') -> set filter_by_method = true only if 'method' is 'PUT'
     */
    self.filterByPropertyValue = function(propertyToRead, valueToTest, propertyToSet, inverse) {
      var j, len, ref, x;
      ref = self.requests;
      for (j = 0, len = ref.length; j < len; j++) {
        x = ref[j];
        if (inverse === 'false') {
          x[propertyToSet] = x[propertyToRead] === valueToTest ? false : true;
        } else {
          x[propertyToSet] = x[propertyToRead] === valueToTest ? true : false;
        }
      }
      return false;
    };
    self.on('ping', function() {
      return console.log('ping');
    });

    /* Shelve / unshelve requests to local storage to persist them through a browser restart
      TODO: Make this work with Lawnchair not just localstorage
     */
    self.on('shelve_requests', function() {
      return localStorage.setItem('requests', JSON.stringify(self.requests));
    });
    self.on('unshelve_requests', function() {
      self.requests = JSON.parse(localStorage.getItem('requests')) || [];
      return RiotControl.trigger('requests_changed', self.requests);
    });
    self.on('requests_init', function() {
      return self.trigger('requests_changed', self.requests);
    });
    self.on('request_remove', function(e) {
      var i;
      i = self.requests.length - 1;
      while (i >= 0) {
        if (self.requests[i] === e.item) {
          self.requests.splice(i, 1);
        }
        i--;
      }
      return RiotControl.trigger('requests_changed', self.requests);
    });
    self.on('request_add', function(request) {
      request.fail = request.fail || 'request_failed';
      request.status = request.status || 0;
      if ($('#weAreLive').prop('checked')) {
        request.action = 'immediate';
      }
      self.requests.push(request);
      return RiotControl.trigger('requests_changed', self.requests);
    });
    self.on('request_update', function(item, xhr) {
      item.status = parseInt(xhr.status);
      return self.trigger('requests_changed', self.requests);
    });
    self.on('updateRequestFiltering', function(filter_value) {
      var j, k, len, len1, ref, ref1, request;
      if (filter_value === 'all') {
        ref = self.requests;
        for (j = 0, len = ref.length; j < len; j++) {
          request = ref[j];
          request.hidden = false;
        }
      }
      if (filter_value === 'waiting') {
        ref1 = self.requests;
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          request = ref1[k];
          request.hidden = filter_value === 'waiting' && (request.status === void 0 || request.status === 0) ? false : true;
        }
      }
      if (filter_value === 'success') {
        self.setPropertyByPropertyRange('status', 200, 300, 'hidden', 'false');
      }
      if (filter_value === 'failed') {
        self.setPropertyByPropertyRange('status', 400, 500, 'hidden', 'false');
      }
      if (filter_value === 'put') {
        self.filterByPropertyValue('method', 'PUT', 'hidden', 'false');
      }
      if (filter_value === 'get') {
        self.filterByPropertyValue('method', 'GET', 'hidden', 'false');
      }
      if (filter_value === 'post') {
        self.filterByPropertyValue('method', 'POST', 'hidden', 'false');
      }
      if (filter_value === 'delete') {
        return self.filterByPropertyValue('method', 'DELETE', 'hidden', 'false');
      }
    });
    self.on('clearRequests', function(filter_value) {
      console.log("clearRequests " + filter_value);
      if (filter_value === 'success') {
        self.requests.filterByPropertyRange('status', 200, 300);
      }
      if (filter_value === 'failed') {
        self.requests.filterByPropertyRange('status', 400, 500);
      }
      if (filter_value === 'all') {
        self.requests = [];
      }
      if (filter_value === 'get') {
        self.requests = self.requests.removing('method', 'GET');
      }
      if (filter_value === 'post') {
        self.requests = self.requests.removing('method', 'POST');
      }
      if (filter_value === 'delete') {
        self.requests = self.requests.removing('method', 'DELETE');
      }
      return RiotControl.trigger('requests_changed', self.requests);
    });

    /* Attempt to send our request to the server */
    self.on('request_do', function(request) {
      var headers, xhr;
      headers = {
        'Accept': 'application/json; q=1.0, */*',
        'X-CSRFToken': getCsrftoken()
      };
      xhr = $.ajax({
        url: request.url,
        method: request.method,
        data: request.data,
        contentType: 'application/json',
        processData: false,
        headers: headers
      });

      /* Always update our riotjs store instance with the response code */
      xhr.done(function(data, textStatus, jqXHR) {
        var ref;
        if ($.isFunction(request.done)) {
          console.error('This will break localstorage for requests!');
          request.done(data, textStatus, jqXHR);
        }
        if (typeof request.done === 'string') {
          RiotControl.trigger(request.done, data, textStatus, jqXHR, request);
        }
        if (((200 <= (ref = jqXHR.status) && ref <= 400)) && request.method === 'GET') {
          return console.log('test for remove: if ( 200 <= jqXHR.status <= 400 ) and request.method is "GET"');
        }
      });

      /* Always update our riotjs store instance with the response code */
      xhr.always(function(data, textStatus, jqXHR) {
        RiotControl.trigger('request_update', request, jqXHR);
        RiotControl.trigger('requests_changed', self.requests);
        if (typeof request.always === 'string') {
          return RiotControl.trigger(request.always, data, textStatus, jqXHR, request);
        }
      });
      return xhr.fail(function(jqXHR, textStatus, errorThrown) {
        if (typeof request.fail === 'string') {
          return RiotControl.trigger(request.fail, request, jqXHR, textStatus, errorThrown);
        }
      });
    });

    /* Adding a new model to the DRF */
    self.on('model_add', function(modelData, appName, modelName, done) {
      var url;
      url = '/' + appName + '/api/' + modelName + '/';
      return RiotControl.trigger('request_add', {
        'url': url,
        'method': 'POST',
        'data': modelData,
        'done': done
      });
    });

    /* Prepare a request to delete a model instance through DRF */
    self.on('model_remove', function(appName, modelName, modelPk, done) {
      var url;
      url = '/' + appName + '/api/' + modelName + '/' + modelPk + '/';
      return RiotControl.trigger('request_add', {
        'url': url,
        'method': 'DELETE',
        'data': '',
        'done': done,
        'modelPk': modelPk,
        'modelName': modelName,
        'appName': appName
      });
    });

    /* Prepare a request to update a model instance through DRF */
    return self.on('model_update', function(modelData, appName, modelName, modelPk, done, opts) {
      var url;
      url = '/' + appName + '/api/' + modelName + '/' + modelPk + '/';
      return RiotControl.trigger('request_add', {
        'url': url,
        'method': 'PUT',
        'data': modelData,
        'done': done,
        'modelPk': modelPk,
        'modelName': modelName,
        'appName': appName
      });
    });
  };

}).call(this);
