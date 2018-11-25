const negConfig = require('neg-config');

let config = {
  "port": 3000,
  "https": false,
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
  },
  "bot": {
    "tuling": {
      "api": "http://openapi.tuling123.com/openapi/api/v2",
      "request": {
        "reqType": 0,
        "perception": {
          "inputText": {
            "text": "附近的酒店"
          },
          "selfInfo": {
            "location": {
              "city": "成都",
              "province": "四川",
              "street": "天府软件园"
            }
          }
        },
        "userInfo": {
          "apiKey": "5ea3a2cf0e1d40f291fbbf48b4200415",
          "userId": "354632"
        }
      }
    }
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