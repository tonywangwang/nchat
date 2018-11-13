const _ = require('lodash');
let um = require('./user').manager;
let msgr = require('./message').messager;
let rm = require('./room').manager;

class nchat {
  constructor(io) {
    this.io = io;
    this.userManager = new um(io);
    this.roomManager = new rm(io);
    this.messager = new msgr(io);
    this._join = this._join.bind(this);
    this._connect = this._connect.bind(this);
    this._leave = this._leave.bind(this);
    this._actions = this._actions.bind(this);
    this._action_createRoom = this._action_createRoom.bind(this);
    this._action_help = this._action_help.bind(this);
    this.io.on('connection', this._connect)
  }
  _connect(socket) {
    this._join(socket);
    this._leave(socket);
    this.messager.listen(socket, this._actions);
  }

  _join(socket) {
    socket.on("join", (_user, _room) => {
      //用户加入在线用户列表（如果已经在列表，则不会加入）
      let user = this.userManager.add(_user);
      user.sid = socket.id;
      this.userManager.sendUsers();

      //将房间加入到房间列表（如果已经在列表，则不会加入）,添加成功同步所有用户rooms列表
      let room = this.roomManager.add(_room);
      room.userManager.add(user, (r) => {
        if (r == false) {
          this.messager.send_DuplicateJoin({
            roomUrl: room.url,
            roomName: room.name,
            socket
          });
          socket.disconnect(true);
          return;
        }

        socket.join(room.id, () => {
          //向新加入用户本人发送欢迎消息
          this.messager.send_WelcomeToThisRoom({
            roomName: room.name,
            roomUrl: room.url,
            userCount: this.userManager.users.length,
            roomUserCount: room.userManager.users.length,
            socket: socket
          });

          //向除新加入用户本人外其他用户广播用户加入房间消息
          this.messager.send_SomebodyJoinSomeRoom({
            userName: user.name,
            roomName: room.name,
            roomUrl: room.url,
            userCount: this.userManager.users.length,
            roomUserCount: room.userManager.users.length,
            socket: socket
          });

          //向该房间用户同步在该房间的在线users
          this.userManager.sendUsers(room);
          //向新加入用户同步rooms
          this.roomManager.sendRooms(socket);
          //向新加入用户发送该房间历史消息
          this.messager.send_History(socket,room);

        });
      });
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

          this.messager.send_Leave({
            userName: _user.name,
            userCount: this.userManager.users.length,
            roomid: _room.id
          })

          this.userManager.sendUsers(_room);
        }
      });
    });
  }

  _actions(_msg) {
    this._action_createRoom(_msg);
    this._action_help(_msg)
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
    this.roomManager.sendRooms();

  }

  _action_help(_msg) {
    this.messager.send_Help(_msg);
  }

}

module.exports = nchat;