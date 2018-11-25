const _ = require('lodash');
const config = require('./config').get();
const request = require('request');
const user = require('./user').user;


class bot {
  constructor() {
    this.self = new user({
      id: 'xiaoen',
      name: '程序员鼓励师小恩',
      iconUrl: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3774486761,2283055156&fm=26&gp=0.jpg',
    });
  }

  chat(value, userid, cb) {

    config.bot.tuling.request.perception.inputText.text = value;
    config.bot.tuling.request.userInfo.userId = userid;

    var options = {
      uri: config.bot.tuling.api,
      method: 'POST',
      json: config.bot.tuling.request
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        let res = _.map(body.results, (r) => {
          if (r.resultType == 'url')
            return `<a href="${r.values.url}" target="_blank">${r.values.url}</a>`
          if (r.resultType == 'text')
            return r.values.text
          if (r.resultType == 'image')
            return `<a href="${r.values.image}" target="_blank"><img src="${r.values.image}"  width="300px" name="pic_msg"/></a>`
          if (r.resultType == 'news') {
            let news = '';
            r.values.news.forEach(n => {
              news = news + `<a href="${n.detailurl}" target="_blank" title="${n.info}"><img src="${n.icon}"  width="50px" style="margin-right:5px;margin-bottom:2px"/>${n.name}</a><br>`
            });
            return news;
          }

        })

        if (cb != undefined) cb(res);
      } else {

        if (cb != undefined) cb(null);
        console.error('bot.chat failed.');
        console.error('StatusCode:' + response.statusCode);
        console.error('Error:' + error);
      }
    });

  }


}

module.exports.bot = bot;