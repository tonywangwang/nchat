const negConfig = require('neg-config');

let config = {
  "port": 80,
  "https":false,
  "database": "array",
  "statisInterval":60000,
  "message": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/message",
    "loadHistoryMsgCount": 5
  },
  "room": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/room",
    "default": [{
      "id": "nchat_feedback",
      "type": "standalone",
      "name": "N-Chat Feedbacks",
      "desc": "大家可以在这里反馈N-Chat使用过程中的任何问题和建议，感谢&nbsp;<img src='images/emoticon/aixin.gif' width='20px'>",
      "iconUrl": "/images/feedback.png"
    }, {
      "id": "19821028",
      "type": "standalone",
      "name": "N-Chat",
      "desc": "N-Chat是为Newegg程序员打造的开放交流平台",
      "iconUrl": "/images/nchat.png"
    }]
  },
  "user": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/user",
    "default": [{
      "id": "xiaoen",
      "name": "程序员鼓励师小恩",
      "desc": "小恩是程序员鼓励师兼全天候私人助理",
      "iconUrl": "/images/avatar/xiaoen.jpg"
    }]
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
          "apiKey": "",
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