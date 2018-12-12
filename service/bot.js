const _ = require('lodash');
const config = require('./config').get();
const request = require('request');
const user = require('./user').user;
const ejs = require('ejs');
const uuidv1 = require('uuid/v1');
const path = require('path');
const cloudStore = require('./cloudStore');

class botManager {
  constructor(_io, _app) {
    this.io = _io;
    this.app = _app;
    this.bots = [];
    this.agent = new user({
      id: 'xiaoen',
      name: '程序员鼓励师小恩',
      iconUrl: '/images/avatar/xiaoen.jpg',
    });
    this.tuling = this.tuling.bind(this);
    this.init = this.init.bind(this);
    this.rest = this.rest.bind(this);
    this.get = this.get.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.update = this.update.bind(this);
  }

  init() {
    this.get({}, (_bots) => {
      _bots.forEach(_bot => {
        this.bots.push(new bot(_bot));
      });

      if (!this.bots || this.bots.length == 0)
        config.bot.default.forEach(_bot => {
          this.add(_bot);
        });
    });
  }

  rest() {
    if (!this.app) return;
    this.app.post('/api/bot', (req, res) => {
      let bot = req.body;
      bot = this.add(bot);
      res.json(bot);
    });
    this.app.get('/api/bot', (req, res) => {
      let query = {
        id: req.params.id || req.query['id'],
        creator: req.query['creator'],
        roomid: req.query['roomid'],
        roomtype: req.query['roomtype'],
        creator: req.query['creator'],
        pageIndex: req.query['pageIndex'],
        pageSize: req.query['pageSize']
      };

      this.get(query, bots => {
        res.json(bots);
      });
    });

    this.app.delete('/api/bot', (req, res) => {
      this.remove(req.params.id || req.query['id']);
      res.end();
    });

    this.app.put('/api/bot', (req, res) => {
      let bot = req.body;
      bot = this.update(bot);
      res.json(bot);
    });

    this.app.post('/api/bot/test', (req, res) => {
      let _bot = req.body;
      let msg = {
        value: _bot.debugMsg,
        sender: this.agent
      };

      new bot(_bot).work(msg, (_res, options) => {
        ejs.renderFile(path.join(__dirname, '../view/bot_envelope.ejs'), {
          result: _res
        }, (error, str) => {
          if (error) options.error.push(error);
          res.json({
            result: str,
            options: options
          });
        })
      }, true)
    });

  }

  get({
    id,
    roomid,
    roomtype,
    creator,
    pageIndex,
    pageSize
  }, callback) {

    let bots = [];
    pageIndex = pageIndex || 1;
    pageSize = pageSize || 1000;

    if (config.database == 'array') {
      bots = _.filter(this.bots, (b) => {
        return (!id || b.id == id) &&
          (!roomid || !b.room || !b.room.id || roomid == b.room.id) &&
          (!roomtype || !b.room || !b.room.type || roomtype == b.room.type) &&
          (!creator || !b.creator || creator == b.creator);
      });
      bots = _.orderBy(bots, ['time'], ['desc']);
      bots = _.slice(bots, (pageIndex - 1) * pageSize,
        pageIndex * pageSize);
      if (callback) callback(_.orderBy(bots, ['time'], ['asc']));
    }

    if (config.database == 'cloudstore') {
      let queryUrl = config.bot.cloudstore +
        '?sortField=time&sort=desc' +
        (id ? '&f_id=' + id : '') +
        (roomid ? '&f_room.id={"$in":["' + roomid + '",null]}' : '') +
        (roomtype ? '&f_room.type={"$in":["' + roomtype + '",null]}' : '') +
        '&pageSize=' + pageSize +
        '&pageIndex=' + pageIndex +
        (creator ? '&f_creator=' + creator : '')
      cloudStore.get(queryUrl,
        (_bots) => {
          bots = _.orderBy(_bots.rows, ['time'], ['asc']);
          if (callback) callback(bots);
        });
    }
  }

  add(_bot) {
    _bot.time = new Date().getTime();
    let b = new bot(_bot);
    this.get({
      id: b.id
    }, bots => {
      if (bots.length > 0)
        this.update(_bot);
      else {
        if (config.database == 'array') {
          this.bots.push(b)
        }
        if (config.database == 'cloudstore') {
          cloudStore.post(config.bot.cloudstore, b, (result) => {
            if (result)
              this.bots.push(b);
          });
        }

      }
    });
    return b;
  };

  remove(id) {
    if (!id) return;
    let b = this.get({
      id: id
    });

    if (config.database == 'array') {
      _.remove(this.bots, (_b) => {
        return _b.id == id
      });
    }

    if (config.database == 'cloudstore') {
      cloudStore.delete(config.bot.cloudstore + '/' + id, (res) => {
        _.remove(this.bots, (_b) => {
          return _b.id == id
        });
      });
    }

    return b;
  }

  update(_bot) {
    _bot.etime = new Date().getTime();
    let b = new bot(_bot);

    if (config.database == 'array') {
      this.remove(b.id);
      this.bots.push(b)
    }

    if (config.database == 'cloudstore') {
      cloudStore.update(config.bot.cloudstore, b, (res) => {
        if (res) {
          _.remove(this.bots, (_b) => {
            return _b.id == _bot.id
          });
          this.bots.push(b)
        }
      });
    }
    return b;
  }

  work(msg, cb) {
    this.bots.forEach(_bot => {
      _bot.work(msg, cb);
    });
  }

  tuling(value, userid, cb) {
    config.bot.tuling.request.perception.inputText.text = value;
    config.bot.tuling.request.userInfo.userId = userid;

    let options = {
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
            return `<a href="${r.values.image}" target="_blank"><img src="${r.values.image}"  name="pic_msg" /></a>`
          if (r.resultType == 'news') {
            let news = '';
            r.values.news.forEach(n => {
              news = news + `<a href="${n.detailurl}" target="_blank" title="${n.info}"><img src="${n.icon}"  name="icon_msg" onmousemove="showBigPic(this.src)" onmouseout="closeimg()"/>${n.name}</a><br>`
            });
            return news;
          }

        })
        if (cb != undefined) cb(res);
      } else {
        if (cb != undefined) cb(null);
        console.error('bot.chat failed.');
        console.error('Error:' + error);
      }
    });

  }
}

class bot {
  constructor({
    id,
    name,
    desc,
    api,
    method,
    headers,
    match,
    params,
    input,
    output,
    room,
    creator,
    time,
    enabled,
    editor,
    etime
  }) {
    this.id = id || uuidv1();
    this.name = name;
    this.desc = desc;
    this.api = api;
    this.method = method;
    this.headers = headers;
    this.match = match;
    this.params = params || '';
    this.input = input || '';
    this.output = output || '';
    this.room = room;
    this.creator = creator;
    this.time = eval(time) || new Date().getTime();
    this.enabled = eval(enabled) == undefined ? true : eval(enabled);
    this.editor = editor;
    this.etime = eval(etime) || (editor ? (new Date()).getTime() : undefined);
  }

  work(msg, cb, debug) {

    if (!debug && !this.enabled) return;
    if (this.room && this.room.type && this.room.type != msg.room.type) return;
    if (this.room && this.room.id && this.room.id != msg.room.id) return;

    let options = {};
    options.error = [];
    let res = '';

    try {

      if (!(new RegExp(this.match, 'i')).test(msg.value)) {
        options.error.push('输入消息未被规则匹配');
        if (debug) cb(res, options);
        return;
      };

      let params = (new RegExp(this.params, 'igm')).exec(msg.value);

      if (!this.api) {
        res = ejs.render(this.output, {
          params: params,
          message: msg,
          result: res
        });
        if (debug) cb(res, options);
        else if (cb) cb(res);
        return false;
      }

      if (this.method == 'GET')
        options = {
          uri: this.api + ejs.render(this.input, {
            params: params,
            message: msg
          }),
          method: this.method,
          headers: this.headers,
          error: []
        };
      else
        options = {
          uri: this.api,
          method: this.method,
          headers: this.headers,
          json: JSON.parse(ejs.render(this.input, {
            params: params,
            message: msg
          })),
          error: []
        };

      request(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
          let result = {};
          try {
            result = JSON.parse(body);
          } catch (e) {
            result = body;
          }
          res = ejs.render(this.output, {
            params: params,
            result: result,
            message: msg
          })
          if (debug) {
            options.response = response;
            options.body = body;
            cb(res, options);
          } else if (cb) cb(res);
        } else {
          options.response = response;
          options.body = body;
          options.error.push(error);
          console.error(error);
          if (debug)
            cb(res, options);
        }
      });
    } catch (e) {
      options.error.push(e);
      console.error(e);
      if (debug)
        cb(res, options);
    }
  }
}

module.exports.bot = bot;
module.exports.botManager = botManager;