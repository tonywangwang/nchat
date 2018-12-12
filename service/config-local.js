module.exports = {
  "port": 80,
  "https": false,
  "database": "cloudstore",
  "statisInterval": 60000,
  "message": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/message_test",
    "loadHistoryMsgCount": 5
  },
  "room": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/room_test",
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
    }
    , {
      "id": "nchat_bot",
      "type": "standalone",
      "name": "N-Chat 机器人测试专用",
      "desc": "你在这里可以进行机器人功能测试或者试用",
      "iconUrl": "/images/walle.png"
    }
  ]
  },
  "user": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/user_test",
    "default": [{
      "id": "xiaoen",
      "name": "程序员鼓励师小恩",
      "desc": "小恩是程序员鼓励师兼全天候私人助理",
      "iconUrl": "/images/avatar/xiaoen.jpg"
    }]
  },
  "bot": {
    "cloudstore": "http://apis.newegg.org/datastore/v1/nchat/bot_test",
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
    },

    default: [{
      "id": "1476bab0-fa16-11e8-ab7f-4f0a56af5b52",
      name: '员工信息查询',
      desc: '员工信息查询,员工信息查询,员工信息查询',
      api: 'http://10.16.75.23:8555/api/employees/query',
      method: 'GET',
      headers: {
        auth: 'ssss'
      },
      match: '(\\w*\\s*\\w*[\u4e00-\u9fa5]*)的信息',
      params: '(\\w*\\s*\\w*[\u4e00-\u9fa5]*)的信息',
      input: '?Member=<%- encodeURIComponent("%" + params[1] + "%")%>&GroupBy=Member',
      output: `~~~
      <%-JSON.stringify(result.result)%>
      ~~~
      `,
      room: {
        id: null,
        type: 'standalone',
      },
      creator: 'tw14',
      enabled: true
    }]
  }
}