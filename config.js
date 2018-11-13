const negConfig = require('neg-config');

let config = {
  port: 80,
  database: 'array', //'cloudstore',
  message: {
    cloudstore: 'http://xxxx/message',
    loadHistoryMsgCount: 100,
  },
  room: {
    cloudstore: 'http://xxxx/room'
  },
  user: {
    cloudstore: 'http://xxxx/user'
  }
}

enableNegConfig = function (cb) {
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

get = function () {
  return config;
}

init = function (service, cb) {
  if (service == 'negConfig')
    enableNegConfig(cb);
  else
    cb();
}


module.exports.get = get;
module.exports.init = init;