const _ = require('lodash');
const um = require('./user').manager;
const msgr = require('./message').messager;
const rm = require('./room').manager;
const room = require('./room').room;

class nchat {
  constructor(io) {
    this.io = io;
    this.userManager = new um(io);
    this.roomManager = new rm(io);
    this.messager = new msgr(io);
    this._plugin_join = this._plugin_join.bind(this);
    this._message = this._message.bind(this);
    this._join = this._join.bind(this);
    this._connect = this._connect.bind(this);
    this._leave = this._leave.bind(this);
    this._actions = this._actions.bind(this);
    this._action_createRoom = this._action_createRoom.bind(this);
    this._action_help = this._action_help.bind(this);
    this._action_sendMsgToAll = this._action_sendMsgToAll.bind(this);
    this.io.on('connection', this._connect)
  }
  _connect(socket) {
    this._plugin_join(socket);
    this._join(socket);
    this._leave(socket);
    this._message(socket);
  }

  _message(_socket) {
    _socket.on('message', (_msg) => {
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

      //向新加入用户本人发送欢迎消息
      this.messager.send_WelcomeToThisRoom({
        roomName: room.name,
        roomUrl: room.url,
        userCount: this.userManager.users.length,
        roomUserCount: room.userManager.users.length,
        socket: socket
      });

      //向新加入用户发送该房间历史消息
      this.messager.send_History(socket, room);

      //向所有人通知有新人加入房间
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
    this._action_help(_msg);
    this._action_sendMsgToAll(_msg, _socket)
  }

  _action_createRoom(_msg) {
    if (_msg.value.lastIndexOf('#room#') < 0) return;
    let name = _msg.value.substring(_msg.value.lastIndexOf('#') + 1);
    if (!name || name.trim().length == 0) return;

    let room = this.roomManager.add({
      name: name.trim(),
      type: 'standalone'
    });

    this.messager.send_CreateRoom({
      roomName: room.name,
      roomUrl: room.url,
      _room: _msg.room,
      creater: _msg.sender.name
    });

    //创建成功后，同步所有用户的rooms
    //this.roomManager.sendRooms();

  }

  _action_help(_msg) {
    this.messager.send_Help(_msg);
  }

  _action_sendMsgToAll(_msg, _socket) {
    this.messager.send_ToAll(_msg, _socket);
  }

}

module.exports = nchat;