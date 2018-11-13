const config = require('neg-config').getConfig();
const request = require('request');

exports.get = function (url, cb) {
  var options = {
    uri: url,
    method: 'GET'
  };
  request(options, function (error, response, body) {
    if (!error && (response.statusCode == 200 || response.statusCode == 204)) {
      if (response.statusCode == 204)
        cb(null);
      else
        cb(JSON.parse(body));
    } else {
      console.error('Get data from ' + options.uri + ' failed.');
      console.error('StatusCode:' + response.statusCode);
      console.error('Error:' + error);
    }
  });
}

exports.post = function (url, data, cb) {
  var options = {
    uri: url,
    method: 'POST',
    json: data
  };
  
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 202) {
      if (cb!=undefined)  cb(body);
    } else {
      if (cb!=undefined)  cb(null);
      console.error('Post  failed.');
      console.error('StatusCode:' + response.statusCode);
      console.error('Error:' + error);
    }
  });
}