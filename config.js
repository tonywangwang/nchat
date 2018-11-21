const negConfig = require('neg-config');

let config = {
  "port": 3000,
  "database": "array",
  "message": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/message?pageSize=100&sortField=time&sort=desc",
    "loadHistoryMsgCount": 100
  },
  "room": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/room"
  },
  "user": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/user"
  }
}

let enableNegConfig = function (cb) {
  negConfig.init({
      env: process.env.ENV == 'PRD' ? 'prd' : 'prdtesting'
    })
    .then(() => {
      negConfig.watchConfig('cd_mis', 'nchat', (_config) => {
        config = _config;
        cb();
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

exports.get = function () {
  return config;
};
exports.init = function (service, cb) {
  if (service == 'negConfig')
    enableNegConfig(cb);
  else
    cb();
};