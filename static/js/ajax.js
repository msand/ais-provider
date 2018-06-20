function postJSON(url, data, successHandler, errorHandler) {

  
  var xhr = typeof XMLHttpRequest != 'undefined'
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('post', url, true);
  xhr.setRequestHeader('accept', 'application/json');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    var status;
    var data;
    // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
    if (xhr.readyState == 4) { // `DONE`
      status = xhr.status;
      if (status == 200) {
        if(xhr.responseText) {
          try {
            data = JSON.parse(xhr.responseText);
          } catch(e) {
            if(typeof console !== 'undefined') {
              console.log(e);
            }
          }
        }
        successHandler && successHandler(data);
      } else if(status == 401) {
        window.location.href = '/login?error=logged_out';
      } else {
        errorHandler && errorHandler(status);
      }
    }
  };
  xhr.send(JSON.stringify(data));
}

/* global ActiveXObject: false */
function getJSON(url, successHandler, errorHandler) {
  
  var xhr = typeof XMLHttpRequest != 'undefined'
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('get', url, true);
  xhr.setRequestHeader('accept', 'application/json')
  xhr.onreadystatechange = function() {

    var status;
    var data;
    // https://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
    if (xhr.readyState == 4) { // `DONE`
      status = xhr.status;
      if (status == 200) {
        if(xhr.responseText) {
          try {
            data = JSON.parse(xhr.responseText);
          } catch(e) {
            if(typeof console !== 'undefined') {
              console.log(e);
            }
          }
        }
        successHandler && successHandler(data);
      } else if(status == 401) {
        window.location.href = '/login?error=logged_out';
      } else {
        
        errorHandler && errorHandler(status);
      }
    }
  };
  xhr.send();
}