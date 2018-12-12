const config = require('neg-config').getConfig();
const request = require('request');

exports.get = function (url, cb) {
  var options = {
    uri: url,
    method: 'GET'
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if (cb) cb(JSON.parse(body));
    } else {
      if (cb) cb(null);
      console.error('Get data from ' + options.uri + ' failed.');
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
      if (cb) cb(body);
    } else {
      if (cb) cb(null);
      console.error('Post failed.');
      console.error('Error:' + error);
    }
  });
}

exports.delete = function (url, cb) {
  var options = {
    uri: url,
    method: 'DELETE',
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 202) {
      if (cb) cb(response.statusCode);
    } else {
      if (cb) cb(null);
      console.error('Delete failed.');
      console.error('Error:' + error);
    }
  });
}

exports.update = function (url, data, cb) {
  var options = {
    uri: url,
    method: 'PUT',
    json: data
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 202) {
      if (cb) cb(body);
    } else {
      if (cb) cb(null);
      console.error('Update failed.');
      console.error('Error:' + error);
    }
  });
}