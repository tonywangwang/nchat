const _ = require('lodash');
const config = require('./config').get();

class manager {
  constructor(_io) {
    this.bot = {
      id: 'xiaoen',
      name: '程序员鼓励师小恩',
      iconUrl: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3774486761,2283055156&fm=26&gp=0.jpg',
    };
    this.io = _io;
    this.users = [];
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.sendUsers = this.sendUsers.bind(this);
    this.removeBySid = this.removeBySid.bind(this);
    this.getById = this.getById.bind(this);
  }

  add(_user, _cb) {
    let u = _.findLast(this.users, {
      id: _user.id
    });

    if (u == undefined) {
      u = new user(_user);
      this.users.push(u);
      if (_cb != undefined) _cb(true);
    } else {
      if (_cb != undefined) _cb(false);
    }

    return u;
  };

  remove(_user) {
    _.remove(this.users, (_u) => {
      return _u.id == _user.id
    });
  };

  removeBySid(sid) {
   return _.remove(this.users, (_u) => {
      _u.removeSocket(sid);
      return _u.sockets.length == 0
    }).pop();
  };

  getById(_id) {
    return _.findLast(this.users, {
      id: _id
    });
  }

  sendUsers(_room) {
    //向指定房间用户同步在该房间的在线users
    if (_room != undefined)
      this.io.to(_room.socket_room).emit('room_users', _room.userManager.users);
    else
      //向所有人同步所有在线users
      this.io.emit('users', this.users);
  }


}

class user {
  constructor({
    id,
    name,
    desc,
    iconUrl
  }) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.iconUrl = iconUrl;
    this.sockets = [];
    this.addSocket = this.addSocket.bind(this);
    this.removeSocket = this.removeSocket.bind(this);
  }

  addSocket(sid) {
    if (this.sockets.lastIndexOf(sid) >= 0) return;
    this.sockets.push(sid);
  }

  removeSocket(sid) {
    _.remove(this.sockets, (_s) => {
      return _s == sid
    })
  }
}

module.exports.user = user;
module.exports.manager = manager;