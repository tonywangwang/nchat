

//$(function(){
var nchatBot = new Vue({
  el: '#nchat_bot',
  data: {
    user: {},
    bots: [],
    bot: {},
    keywords: '',
    mode: 'list',
    input: '',
    output: '',
    debugInfo: {},
    info: [],
    listModeScrollTop: 0,
    testRoomUrl: '/?roomid=nchat_bot&roomtype=standalone'
  },
  computed: {
    rows: function () {
      var index = 2;
      return _.groupBy(this.searchBots, () => {
        index++;
        return Math.floor(index / 3)
      });
    },
    headers: {
      get: function () {
        return JSON.stringify(this.bot.headers);
      },
      set: function (value) {
        if (utils.isJSON(value)) {
          this.bot.headers = JSON.parse(value);
        }
      }
    },
    searchBots: function () {
      return _.filter(this.bots, (bot) => {
        return _.lowerCase(bot.name).includes(_.lowerCase(this.keywords)) ||
          _.lowerCase(bot.desc).includes(_.lowerCase(this.keywords)) ||
          _.lowerCase(bot.creator).includes(_.lowerCase(this.keywords)) ||
          _.lowerCase(bot.editor).includes(_.lowerCase(this.keywords)) ||
          _.lowerCase(bot.api).includes(_.lowerCase(this.keywords))
      });
    }
  },
  methods: {
    updateStatus: function () {
      this.bot.enabled = !this.bot.enabled;
      if(!this.update())
        this.bot.enabled = !this.bot.enabled;
    },
    editable: function (bot) {
      if (bot)
        return bot.creator == this.user.id || bot.editor == this.user.id || this.user.isAdmin
      else
        return this.bot.creator == this.user.id || this.bot.editor == this.user.id || this.user.isAdmin
    },
    login: function () {
       login_ne((userInfo) => {
         this.user.id = userInfo.UserID;
         this.user.name = userInfo.FullName + ' (' + userInfo.Title + ')';
         this.user.iconUrl = userInfo.Avatar;
         this.get();
       })
    },
    logout: function () {
      logout_ne();
    },
    get: function () {
      $.get(window.location.origin + '/api/bot', (bots) => {
        this.bots = bots;
      });
    },
    add: function () {
      //this.info = [];
      if (!this.checkForm()) return;
      this.bot.creator = this.user.id;
      $.post(window.location.origin + '/api/bot', this.bot,
        (bot) => {
          if (bot.id) {
            this.bot = _.merge(this.bot, bot);
            this.bots.push(this.bot);
            this.info.push({
              info: 'create [' + bot.name + '] successful',
              type: 'success',
              time: new Date().getTime()
            })
          } else
            this.info.push({
              info: 'create [' + this.bot.name + '] failed',
              type: 'danger',
              time: new Date().getTime()
            })
        }, 'json');
    },
    del: function () {
      $.ajax({
        url: window.location.origin + '/api/bot?id=' + this.bot.id,
        type: 'delete',
        success: () => {
          var index = this.bots.indexOf(this.bot)
          this.bots.splice(index, 1)
          this.mode = 'list';
          this.info.push({
            info: 'delete [' + this.bot.name + '] successful',
            type: 'success',
            time: new Date().getTime()
          })
        },
        error: () => {
          this.info.push({
            info: 'delete [' + this.bot.name + '] failed',
            type: 'danger',
            time: new Date().getTime()
          })
        }
      });
    },
    update: function () {
      //this.info = [];
      if (!this.checkForm()) return;
      this.bot.editor = this.user.id;
      $.ajax({
        url: window.location.origin + '/api/bot',
        type: 'put',
        data: this.bot,
        dataType: 'json',
        success: (bot) => {
          this.bot = _.merge(this.bot, bot);
          this.info.push({
            info: 'update [' + bot.name + '] successful',
            type: 'success',
            time: new Date().getTime()
          });
          return true;
        },
        error: () => {
          this.info.push({
            info: 'update [' + this.bot.name + '] failed',
            type: 'danger',
            time: new Date().getTime()
          })
        }
      });
    },
    test: function () {
      //this.info = [];
      var checked = true;
      if (!this.checkForm('isDebug')) checked = false;
      if (!this.input) {
        $("#test_msg").focus();
        this.info.push({
          info: '请先输入 "测试-消息"',
          type: 'warning',
          time: new Date().getTime()
        });
        checked = false;
      }
      if (!checked) return;

      this.output = '';
      this.debugInfo = null;
      this.bot.debugMsg = this.input;
      $.post(window.location.origin + '/api/bot/test', this.bot,
        (res) => {
          this.output = res.result;
          this.debugInfo = res.options;
          this.$nextTick(function () {
            mermaid.init();
          })
        }, 'json');
    },
    switchMode: function (mode, bot) {
      if (mode == 'list')
        $('#content').scrollTop(this.listModeScrollTop);
      else {
        this.listModeScrollTop = $('#content').scrollTop();
        $('#content').scrollTop(0);
        this.input = '';
        this.output = '';
        this.info = [];
        this.debugInfo = null;
      }

      if (mode == 'copy') {
        bot = _.cloneDeep(bot);
        bot.id = null;
        mode = 'edit';
      }
      this.bot = bot;
      this.mode = mode;
      if (mode == 'view')
        this.$nextTick(function () {
          mermaid.init();
        });
    },
    test_match: function () {
      var checked = true;
      if (!this.input) {
        $("#test_msg").focus();
        this.info.push({
          info: '请先输入 "测试-消息"',
          type: 'warning',
          time: new Date().getTime()
        });
        checked = false;
      }
      if (!this.bot.match) {
        $("#bot_match").focus();
        this.info.push({
          info: '请先输入 "消息-匹配" 规则',
          type: 'warning',
          time: new Date().getTime()
        });
        checked = false;
      }

      if (!checked) return;

      var result = utils.reg_test(this.bot.match, this.input);
      this.info.push({
        info: '消息匹配结果: ' + result,
        type: result ? 'success' : 'warning',
        time: new Date().getTime()
      })
    },
    test_params: function () {
      var checked = true;
      if (!this.input) {
        $("#test_msg").focus();
        this.info.push({
          info: '请先输入 "测试-消息"',
          type: 'warning',
          time: new Date().getTime()
        });
        checked = false;
      }

      if (!this.bot.params) {
        $("#bot_params").focus();
        this.info.push({
          info: '请先输入 "消息-关键词提取" 规则',
          type: 'warning',
          time: new Date().getTime()
        });
        checked = false;
      }

      if (!checked) return;

      var result = JSON.stringify(utils.reg_exec(this.bot.params, this.input));
      this.info.push({
        info: '消息参数提取结果: ' + result,
        type: result != 'null' ? 'success' : 'warning',
        time: new Date().getTime()
      })
    },
    delInfo: function (index) {
      this.info.splice(index, 1)
    },
    checkForm: function (flag) {
      var checked = true;
      if (!this.bot.name) {
        this.info.push({
          info: '必须填写功能的 "名称"',
          type: 'danger',
          time: new Date().getTime()
        });
        checked = false;
      }

      if (!this.bot.desc) {
        this.info.push({
          info: '必须提供功能的 "描述",以便用户知道如何使用该功能，以及其他开发者知道该功能已经实现的特性',
          type: 'danger',
          time: new Date().getTime()
        });
        checked = false;
      }

      if (!this.bot.match) {
        this.info.push({
          info: '必须设置明确的 "消息-匹配" 规则,否则所有消息都将被拦截处理',
          type: 'danger',
          time: new Date().getTime()
        });
        checked = false;
      }

      if (this.bot.api) {
        var reg = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/;
        if (!reg.test(this.bot.api)) {
          this.info.push({
            info: '"接口-URL"格式不正确，请检查并修正',
            type: 'danger',
            time: new Date().getTime()
          });
          checked = false;
        }
        if (!this.bot.method) {
          this.info.push({
            info: '"接口-请求方法"和"接口-URL"必须同时指定',
            type: 'danger',
            time: new Date().getTime()
          });
          checked = false;
        }
      }

      if (this.headers && !utils.isJSON(this.headers)) {
        this.info.push({
          info: '"接口-头部信息" 不是正确的JSON格式，请检查并修正' + e,
          type: 'danger',
          time: new Date().getTime()
        });
        checked = false;
      }

      if (flag != 'isDebug') {
        if (!this.bot.output || !this.debugInfo || this.debugInfo.error.length > 0) {
          this.info.push({
            info: '提交或者更新功能前，请先通过测试',
            type: 'danger',
            time: new Date().getTime()
          });
          checked = false;
        }
      }

      return checked;
    },
    help: function () {
      //message对象结构
      var md = marked(helpText);

      this.info.push({
        info: md,
        type: 'success',
        time: new Date().getTime()
      })

    }
  },
  filters: {
    localTime: function (time) {
      return utils.localTime(time);
    }
  }
});


/*nchatBot.user = {
  id: 'tw14',
  name: 'Tony.J.Wang（Manager,MIS）',
  iconUrl: '/images/avatar/default.jpg'
};*/
nchatBot.login();
var helpText = `~~~javascript
//params对象结构示例:["订单123456的详情","订单","123456"]
//message对象结构示例:
{
  "id": "540ed8a0-fb98-11e8-96d2-597ec10e072a",
  "value": "我不会说英语的啦，你还是说中文吧。",
  "sender": {
    "id": "xiaoen",
    "name": "程序员鼓励师小恩",
    "iconUrl": "/images/avatar/xiaoen.jpg",
  },
  "room": {
    "id": "19821028",
    "name": "N-Chat",
    "desc": "N-Chat是为Newegg程序员打造的开放交流平台",
    "type": "standalone",
    "url": "?roomid=19821028&roomtype=standalone",
    "iconUrl": "/images/nchat.png",
    "socket_room": "standalone_19821028"
  },
  "time": 1544349229866
  }
~~~`;
//});