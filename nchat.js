const _ = require('lodash');
let um = require('./user').manager;
let msgr = require('./message').messager;
let rm = require('./room').manager;

class nchat {
  constructor(io) {
    this.io = io;
    this.userManager = new um();
    this.roomManager = new rm();
    this.messager = new msgr();
    this._join = this._join.bind(this);
    this._connect = this._connect.bind(this);
    this._leave = this._leave.bind(this);
    this._sendMessage = this._sendMessage.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this._actions = this._actions.bind(this);
    this._action_createRoom = this._action_createRoom.bind(this);
    this._action_help = this._action_help.bind(this);
    this.io.on('connection', this._connect)
  }
  _connect(socket) {
    this._join(socket);
    this._leave(socket);
    this._sendMessage(socket);
  }

  _join(socket) {
    socket.on("join", (_user, _room) => {

      //用户加入在线用户列表（如果已经在列表，则不会加入）
      let user = this.userManager.add(_user);
      user.sid = socket.id;

      //将房间加入到房间列表（如果已经在列表，则不会加入）,添加成功同步所有用户rooms列表
      let room = this.roomManager.add(_room, () => (r) => {
        if (r) this.io.emit('rooms', this.roomManager.rooms);
      });

      room.userManager.add(user, (r) => {

        if (r == false) {
          let msg = this.messager.botMessage('你已经加入该房间,不能重复加入');
          socket.emit('message', msg);
          socket.disconnect(true);
          return;
        }

        socket.join(room.id, () => {
          //向新加入用户本人发送欢迎消息
          socket.emit('message', this.messager.welcomeMsg1({
            roomName:room.name,
            roomUrl:room.url,
            userCount: this.userManager.users.length,
            roomUserCount: room.userManager.users.length
          }));

          //向除新加入用户本人外其他用户广播用户加入房间消息
          socket.broadcast.emit('message', this.messager.welcomeMsg2({
            userName: user.name,
            roomName: room.name,
            roomUrl: room.url,
            userCount: this.userManager.users.length,
            roomUserCount: room.userManager.users.length
          }));

          //向该房间用户同步在该房间的在线users
          this.io.to(room.id).emit('room_users', room.userManager.users);

          //向所有人同步所有在线users
          this.io.emit('users', this.userManager.users);

          //想新加入用户同步rooms
          socket.emit('rooms', this.roomManager.rooms);

          //向新加入用户发送该房间历史消息
          for (let i in this.messager.messages) {
            if (this.messager.messages[i].room.id == room.id)
              socket.emit('message', this.messager.messages[i]);
          }

        });


      });


    });
  }
  _leave(socket) {
    socket.on("disconnect", () => {
      this.roomManager.removeUserBySid(socket.id, (_user, _room) => {
        if (!this.roomManager.isInAnyRoom(_user))
          this.userManager.remove(_user);
        if (_user) {
          this.io.to(_room.id).emit('message',
            this.messager.leaveMsg({
              userName: _user.name,
              userCount: this.userManager.users.length
            }));

          //向该房间用户同步在该房间的在线users
          this.io.to(_room.id).emit('room_users', _room.userManager.users);
          //向所有人同步所有在线users
          this.io.emit('users', this.userManager.users);

        }
      });
    });
  }

  _sendMessage(socket) {
    socket.on('message', (_msg) => {
      let msg = this.messager.add(_msg);
      socket.to(msg.room.id).emit('message', msg);
      this._actions(msg);
    });
  }

  sendMessage(_msg) {
    let msg = this.messager.add(_msg);
    if (msg.room != null)
      this.io.to(msg.room.id).emit('message', msg);
    else
      this.io.emit('message', msg);
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

    let msg = this.messager.createRoomMsg({
      roomName: name,
      roomUrl: room.url,
      creater: _msg.sender.name
    });
    msg.room = _msg.room;

    //创建成功后，同步所有用户的rooms
    this.io.emit('rooms', this.roomManager.rooms);

    this.sendMessage(msg);
  }

  _action_help(_msg) {
    if (_msg.value.lastIndexOf('#?') < 0) return;

    let msg = this.messager.helpMsg();
    msg.room = _msg.room;

    this.sendMessage(msg);
  }

}

module.exports = nchat;