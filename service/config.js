const negConfig = require('neg-config');
const localConfig = require('./config-local');

let config = localConfig;

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