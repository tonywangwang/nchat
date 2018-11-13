const uuidv1 = require('uuid/v1');
const cloudStore = require('./cloudStore');
const config = require('./config').get();
let user = require('./user').user;

class messager {
  constructor(_io) {
    this.io = _io;
    this.messages = [];
    this.listen = this.listen.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.send = this.send.bind(this);
    this.send_WelcomeToThisRoom = this.send_WelcomeToThisRoom.bind(this);
    this.send_SomebodyJoinSomeRoom = this.send_SomebodyJoinSomeRoom.bind(this);
    this.send_History = this.send_History.bind(this);
    this.send_Leave = this.send_Leave.bind(this);
    this.send_CreateRoom = this.send_CreateRoom.bind(this);
    this.send_Help = this.send_Help.bind(this);
    this.send_DuplicateJoin = this.send_DuplicateJoin.bind(this);
    this.botMessage = this.botMessage.bind(this);

  }

  listen(_socket, _cb) {
    _socket.on('message', (_msg) => {
      this.send(_msg, _socket);
      if (_cb == undefined) return;
      _cb(_msg);
    });
  }


  send_History(socket, room) {
    
    if (config.database == 'array') {
      for (let i in this.messages) {
        if (this.messages[i].room.id == room.id)
          socket.emit('message', this.messages[i]);
      }
    }

    if (config.database == 'cloudStore') {
      cloudStore.get(config.message.cloudstore, //获取符合config配置条件以及room.id的messages
        function (_messages) {
          _messages.forEach(_msg => {
            socket.emit('message', _msg);
          });
        });
    }

  }

  add(_message) {
    let m = new message(_message);
    if (config.database == 'array') {
      this.messages.push(m)
    }
    if (config.database == 'cloudStore') {
      cloudStore.post(config.message.cloudstore, m);
    }
    return m;
  };

  remove(_message) {
    messages.splice(_message)
  };

  send(_msg, _socket) {
    let msg = this.add(_msg);
    if (_socket != undefined) {
      _socket.to(msg.room.id).emit('message', msg);
      return;
    }

    if (msg.room != null)
      this.io.to(msg.room.id).emit('message', msg);
    else
      this.io.emit('message', msg);
  }

  send_WelcomeToThisRoom({
    roomUrl,
    roomName,
    userCount,
    roomUserCount,
    socket: socket
  }) {
    socket.emit('message', this.botMessage(
      `欢迎进入  <a href="${roomUrl}" target="_blank">${roomName}</a>,
    当前总计有 ${userCount} 位 Newgger 在线,该房间有 ${roomUserCount} 位 Newegger 在线`));
  };

  send_SomebodyJoinSomeRoom({
    userName,
    roomUrl,
    roomName,
    userCount,
    roomUserCount,
    socket
  }) {

    socket.broadcast.emit('message', this.botMessage(`${userName}  进入了 <a href="${roomUrl}" target="_blank">${roomName}</a> 
    当前总计有 ${userCount} 位 Newegger 在线,该房间有 ${roomUserCount} 位 Newegger 在线`));
  }

  send_DuplicateJoin({
    roomUrl,
    roomName,
    socket
  }) {
    let msg = this.botMessage(`你已经加入 <a href="${roomUrl}" target="_blank">${roomName}</a> ,不能重复加入`);
    socket.emit('message', msg);
  }

  send_Leave({
    userName,
    userCount,
    roomid,
  }) {

    this.io.to(roomid).emit('message',
      this.botMessage(`${userName} 转身离开，当前总计有  ${userCount} 位 Newgger 在线`));
  }

  send_Help(_msg) {
    if (_msg.value.lastIndexOf('#?') < 0) return;
    let msg = this.botMessage(`N-Chat用户指南: 1.拖拽发送图片 2.发送 <font color="red">#room#房间名称</font> 创建新的房间 3.发送 <font color="red">#?</font> 获得帮助`);
    msg.room = _msg.room;
    this.send(msg);
  }

  send_CreateRoom({
    roomName,
    roomUrl,
    _room,
    creater
  }) {

    let msg = this.botMessage(` ${creater}  创建了新的房间 <a href="${roomUrl}" target="_blank">${roomName}</a>`)
    msg.room = _room;
    this.send(msg);
  }

  botMessage(value) {
    return new message({
      value: value,
      sender: new user({
        id: 'xiaoen',
        name: '程序员鼓励师小恩',
        iconUrl: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3774486761,2283055156&fm=26&gp=0.jpg',
      })
    })
  }
}

class message {
  constructor({
    id,
    value,
    type,
    sender,
    receiver,
    room,
    time
  }) {
    this.id = id || uuidv1();
    this.value = value;
    this.type = type;
    this.sender = sender;
    this.receiver = receiver;
    this.room = room;
    this.time = time || (new Date()).toUTCString();
  }
}
module.exports.messager = messager;
module.exports.message = message;