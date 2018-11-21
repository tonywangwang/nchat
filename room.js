const _ = require('lodash');
const uuidv1 = require('uuid/v1');
const config = require('./config').get();
let um = require('./user').manager;

class manager {

  constructor(_io) {
    this.io = _io;
    this.rooms = [];
    this.listen = this.listen.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.sendRooms = this.sendRooms.bind(this);
    this.isInAnyRoom = this.isInAnyRoom.bind(this);
    this.getById = this.getById.bind(this);
    this.removeUserBySid = this.removeUserBySid.bind(this);
  }

  listen(_socket, _cb) {

  }

  add(_room, _cb) {
    let r = _.findLast(this.rooms, {
      id: _room.id,
      type: _room.type
    });

    if (r == undefined) {
      r = new room(_room);
      this.rooms.push(r);
      this.sendRooms();
      if (_cb != undefined) _cb(true);
    } else {
      if (_cb != undefined) _cb(false);
    }

    return r;
  };

  remove(_room) {
    let r = _.findLast(this.rooms, {
      id: _room.id,
      type: _room.type
    });
    if (r != undefined)
      _.remove(this.rooms, (_r) => {
        return _r.id == r.id && _r.type == r.type
      });

    return r;
  };

  sendRooms(_socket) {

    if (_socket != undefined)
      _socket.emit('rooms', this.rooms);
    else
      this.io.emit('rooms', this.rooms)

  }

  removeUserBySid(sid, cb) {
    let _user;
    this.rooms.forEach((_room) => {
      _user = _room.userManager.removeBySid(sid);
      if (_user != undefined) {
        if (cb != undefined) cb(_user, _room);
        return _user;
      }
    });
    return _user;
  }

  isInAnyRoom(_user) {
    this.rooms.forEach((_room) => {
      if (_room.userManager.getById(_user.id))
        return true;
    });

    return false;

  }

  getById(_id) {
    return _.findLast(this.rooms, {
      id: _id
    });
  }

}

class room {
  constructor({
    id,
    name,
    desc,
    type,
    url,
    iconUrl,
  }) {
    this.id = id || uuidv1();
    this.name = name || 'Anonymous';
    this.desc = desc || this.name;
    this.type = type || 'standalone';
    this.url = url || `?roomid=${this.id}&roomtype=${this.type}&roomname=${encodeURIComponent(this.name)}`;
    this.iconUrl = iconUrl || '/images/' + this.type + '.png';
    this.socket_room = this.type + '_' + this.id;
    this.userManager = new um();
  }
}


module.exports.room = room;
module.exports.manager = manager;