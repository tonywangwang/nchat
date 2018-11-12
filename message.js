const uuidv1 = require('uuid/v1');
let user = require('./user').user;

class messager {
  constructor() {
    this.messages = [];
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.welcomeMsg1 = this.welcomeMsg1.bind(this);
    this.welcomeMsg2 = this.welcomeMsg2.bind(this);
    this.leaveMsg = this.leaveMsg.bind(this);
    this.createRoomMsg = this.createRoomMsg.bind(this);
    this.helpMsg = this.helpMsg.bind(this);
    this.botMessage = this.botMessage.bind(this);

  }

  add(_message) {
    let m = new message(_message);
    this.messages.push(m)
    return m;
  };

  remove(message) {
    messages.splice(message)
  };

  welcomeMsg1({
    roomUrl,
    roomName,
    userCount,
    roomUserCount
  }) {
    return this.botMessage(
      `欢迎进入  <a href="${roomUrl}" target="_blank">${roomName}</a>,
    当前总计有 ${userCount} 位 Newgger 在线,该房间有 ${roomUserCount} 位 Newegger在线`);
  }

  welcomeMsg2({
    userName,
    roomUrl,
    roomName,
    userCount,
    roomUserCount
  }) {
    return this.botMessage(`${userName} 进入了 <a href="${roomUrl}" target="_blank">${roomName}</a> 
    当前总计有 <font color="red">${userCount}位</font> Newegger 在线,该房间有 ${roomUserCount} 位 Newegger在线`)
  }

  leaveMsg({
    userName,
    userCount
  }) {
    return this.botMessage(`${userName} 转身离开，当前总计有 <font color="red"> ${userCount} 位</font> 位 Newgger 在线`)
  }

  helpMsg() {
    return this.botMessage(`N-Chat用户指南：`);
  }

  createRoomMsg({
    roomName,
    roomUrl,
    creater
  }) {
    return this.botMessage(`${creater} 创建了新的房间 <a href="${roomUrl}" target="_blank">${roomName}</a>`)
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