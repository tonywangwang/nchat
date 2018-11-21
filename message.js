const uuidv1 = require('uuid/v1');
const cloudStore = require('./cloudStore');
const config = require('./config').get();
const _ = require('lodash');
const path = require('path');
let user = require('./user').user;


class messager {
  constructor(_io) {
    this.io = _io;
    this.messages = [];
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
    this.send_ToAll = this.send_ToAll.bind(this);
    this.send_File = this.send_File.bind(this);
    this.botMessage = this.botMessage.bind(this);

  }

  send_History(socket, room) {

    if (config.database == 'array') {
      for (let i in this.messages) {
        if (this.messages[i].room == null || this.messages[i].room.id == room.id)
          socket.emit('message', this.messages[i]);
      }
    }

    if (config.database == 'cloudstore') {
      cloudStore.get(config.message.cloudstore, //获取符合config配置条件以及room.id的messages
        function (_messages) {
          _.orderBy(_messages.rows, ['time'], ['asc']).forEach(_msg => {
            if (_msg.room == null || _msg.room.id == room.id)
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
    if (config.database == 'cloudstore') {
      cloudStore.post(config.message.cloudstore, m);
    }
    return m;
  };

  remove(_message) {
    _.remove(this.messages, (_m) => {
      return _m.id == _message.id
    });
  };

  send(_msg, _socket) {
    let msg = this.add(_msg);
    if (_socket != undefined) {
      if (msg.room != null)
        _socket.to(msg.room.socket_room).emit('message', msg);
      else
        _socket.broadcast.emit('message', msg);
      return;
    }

    if (msg.room != null)
      this.io.to(msg.room.socket_room).emit('message', msg);
    else
      this.io.emit('message', msg);
  }

  send_File({
    msg: msg,
    url: url,
    name: name
  }) {
    let extname = path.extname(url).toLocaleLowerCase();
    if (extname == '.jpg' ||
      extname == '.png' ||
      extname == '.gif' ||
      extname == '.bmp' ||
      extname == '.ico' ||
      extname == '.jpeg' ||
      extname == '.svg')
      msg.value = `<a href="${url}" target="_blank"><img src="${url}" width="300px" name="pic_msg" title="${name}" alt="${name}"/></a>`;
    else
      msg.value = `<img src="/images/file.png" style="margin-right:5px;width:32px" /><a href="${url}"  name="file_msg">${name}</a>`;
    this.send(msg);
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

    socket.emit('message', this.botMessage(`N-Chat用户指南: 
    <url>
    <li>拖拽发送图片</li> 
    <li>双击窗口切换全屏模式</li>
    <li>发送 <font color="green">#room#房间名称</font> 创建新的房间 </li>
    <li>发送 <font color="green">#help</font> 获得帮助</li>
    <li>消息中加上 <font color="green">@all</font> 将向N-Chat世界广播</li>
    </ul>`));

  };

  send_SomebodyJoinSomeRoom({
    userName,
    roomid,
    roomUrl,
    roomName,
    userCount,
    roomUserCount,
    socket
  }) {

    let msg = this.botMessage(`${userName}  进入了 <a href="${roomUrl}" target="_blank">${roomName}</a> 
    当前总计有 ${userCount} 位 Newegger 在线,该房间有 ${roomUserCount} 位 Newegger 在线`)
    
    if (roomid)
      socket.broadcast.to(roomid).emit('message', msg);
    else
      socket.broadcast.emit('message', msg);
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
    if (_msg.value.lastIndexOf('#help') < 0) return;
    let msg = this.botMessage(`N-Chat用户指南: 
    <url>
    <li>拖拽发送图片</li> 
    <li>双击窗口切换全屏模式</li>
    <li>发送 <font color="green">#room#房间名称</font> 创建新的房间 </li>
    <li>发送 <font color="green">#help</font> 获得帮助</li>
    <li>消息中加上 <font color="green">@all</font> 将向N-Chat世界广播</li>
    </ul>`);
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

  send_ToAll(_msg, _socket) {
    if (_msg.value.lastIndexOf('@all') < 0) return;
    _msg.room = null;
    this.send(_msg, _socket);
  }

  send_DuplicateJoin({
    roomUrl,
    roomName,
    socket
  }) {
    let msg = this.botMessage(`你已经加入 <a href="${roomUrl}" target="_blank">${roomName}</a> ,不能重复加入`);
    socket.emit('message', msg);
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
    this.time = time || (new Date()).getTime();
  }
}
module.exports.messager = messager;
module.exports.message = message;