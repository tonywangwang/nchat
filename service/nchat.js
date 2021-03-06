const _ = require('lodash');
const um = require('./user').manager;
const msgr = require('./message').messager;
const rm = require('./room').manager;
const bm = require('./bot').botManager;
const room = require('./room').room;
const translate = require('./translate').translate;
const file = require('./file');
const html = require('html-entities').AllHtmlEntities;
const config = require('./config').get();

class nchat {
  constructor(_io, _app) {
    this.app = _app;
    this.io = _io;
    this.userManager = new um(_io, _app);
    this.roomManager = new rm(_io, _app);
    this.messager = new msgr(_io, _app);
    this.botManager = new bm(_io, _app);
    this.translate = new translate(_app);
    this.file = new file(_app);
    this._plugin_join = this._plugin_join.bind(this);
    this._message = this._message.bind(this);
    this._join = this._join.bind(this);
    this._connect = this._connect.bind(this);
    this._leave = this._leave.bind(this);
    this._actions = this._actions.bind(this);
    this._action_createRoom = this._action_createRoom.bind(this);
    this._action_sendMsgToAll = this._action_sendMsgToAll.bind(this);
    this._action_chatToBot = this._action_chatToBot.bind(this);
    this._statistics = this._statistics.bind(this);
    this._fileUploads = this._fileUploads.bind(this);
    this.init = this.init.bind(this);
  }

  init() {
    this.roomManager.init();
    this.userManager.init();
    this.botManager.init();
    this.roomManager.rest();
    this.messager.rest();
    this.translate.rest();
    this.botManager.rest();
    this._fileUploads();
    this._statistics();
    this.io.on('connection', this._connect)
  }

  _fileUploads() {
    this.file.uploads(({
      msg,
      url,
      name
    }) => {
      msg.room = this.roomManager.add(msg.room);
      this.messager.send_File({
        msg: msg,
        url: url,
        name: name
      })
    })
  }

  _statistics() {
    setInterval(() => {
      this.messager.send_Statistics()
    }, config.statisInterval);
  }

  _connect(socket) {
    this._plugin_join(socket);
    this._join(socket);
    this._leave(socket);
    this._message(socket);
  }

  _message(_socket) {
    _socket.on('message', (_msg) => {
      //用户发送的消息全部进行html encode
      _msg.value = html.encode(_msg.value);
      _msg.room = new room(_msg.room);
      this.messager.send(_msg, _socket);
      this._actions(_msg, _socket);
    });
  }

  _plugin_join(socket) {
    socket.on("plugin_join", (_user, _room) => {
      let room = this.roomManager.add(_room);
      socket.join(room.socket_room, () => {
        this.userManager.sendUsers(room);
        this.userManager.sendUsers();
      });

    });
  }

  _join(socket) {
    socket.on("join", (_user, _room) => {
      //用户加入在线用户列表（如果已经在列表，则不会加入）
      let user = this.userManager.add(_user);
      user.addSocket(socket.id);
      this.userManager.sendUsers();

      //将房间加入到房间列表,将用户加入room用户列表
      let room = this.roomManager.add(_room);
      room.userManager.add(user).addSocket(socket.id);
      socket.join(room.socket_room);

      //向用户发送统计信息
      this.messager.send_Statistics(socket);

      //向新加入用户发送该房间历史消息
      this.messager.send_History(socket, room, () => {
        //向新加入用户本人发送欢迎消息
        this.messager.send_WelcomeToThisRoom({
          roomName: room.name,
          roomUrl: room.url,
          roomDesc: room.desc,
          userCount: this.userManager.users.length,
          roomUserCount: room.userManager.users.length,
          socket: socket
        });
      });

      //向所有人(roomid指定后，指向当前房间广播)通知有新人加入房间
      this.messager.send_SomebodyJoinSomeRoom({
        userName: user.name,
        roomid: room.socket_room,
        roomName: room.name,
        roomUrl: room.url,
        userCount: this.userManager.users.length,
        roomUserCount: room.userManager.users.length,
        socket: socket
      });

      //向该房间用户同步在该房间的在线users
      this.userManager.sendUsers(room);

      //向所有用户同步rooms(房间人数变化)
      this.roomManager.sendRooms();

    });
  }

  _leave(socket) {
    socket.on("disconnect", () => {
      this.roomManager.removeUserBySid(socket.id, (_user, _room) => {
        if (_user) {
          if (!this.roomManager.isInAnyRoom(_user)) {
            this.userManager.remove(_user);
            this.userManager.sendUsers();
          }

          this.roomManager.sendRooms();
          this.messager.send_Leave({
            userName: _user.name,
            userCount: this.userManager.users.length,
            roomid: _room.socket_room
          });

          this.userManager.sendUsers(_room);
        }
      });
    });
  }

  _actions(_msg, _socket) {
    this._action_createRoom(_msg);
    this._action_sendMsgToAll(_msg, _socket);
    this._action_chatToBot(_msg);
  }

  _action_createRoom(_msg) {
    if (_msg.value.lastIndexOf('#room#') < 0) return;
    let name = _msg.value.substring(_msg.value.lastIndexOf('#') + 1);
    if (!name || name.trim().length == 0) return;

    let room = this.roomManager.add({
      name: name.trim()
    });

    this.messager.send_CreateRoom({
      roomName: room.name,
      roomUrl: room.url,
      _room: _msg.room,
      creater: _msg.sender.name
    });
  }

  _action_sendMsgToAll(_msg, _socket) {
    this.messager.send_ToAll(_msg, _socket);
  }

  _action_chatToBot(_msg) {
    this.botManager.work(_msg,(res)=>{
      let m = this.messager.botMessage(res);
      m.room = _msg.room;
      this.messager.send(m);
    });

    if (_msg.value.lastIndexOf('@@') < 0) return;
    let value = _msg.value.replace('@@', '');
    this.botManager.tuling(value, _msg.sender.id, (values) => {
      if (values != null && values != undefined && values.length > 0)
        values.forEach(_value => {
          let m = this.messager.botMessage(_value);
          m.room = _msg.room;
          this.messager.send(m);
        });
      else {
        let m = this.messager.botMessage('小恩累了，休息一下哦');
        m.room = _msg.room;
        this.messager.send(m);
      }
    });
  }
}

module.exports = nchat;