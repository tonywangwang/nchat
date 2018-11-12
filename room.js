var _ = require('lodash');
const uuidv1 = require('uuid/v1');
let um = require('./user').manager;

class room {
  constructor({
    id,
    name,
    desc,
    type,
    url
  }) {
    this.id = id || uuidv1();
    this.name = name || 'Anonymous';
    this.desc = desc || this.name;
    this.type = type || 'standalone';
    this.url = url || `?roomid=${this.id}&roomtype=${this.type}&roomname=${this.name}`;
    this.userManager = new um();
  }
}

class manager {

  constructor() {
    this.rooms = [];
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
  }

  removeUserBySid(sid, cb) {
    let _user;
    this.rooms.forEach((_room) => {
      _user = _room.userManager.removeBySid(sid)
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
  }

  getById(_id) {
    return _.findLast(this.rooms, {
      id: _id
    });
  }

  add(_room,cb) {
    let r = _.findLast(this.rooms, {
      id: _room.id,
      type: _room.type
    });

    if (r == undefined) {
      r = new room(_room);
      this.rooms.push(r);
      if (cb != undefined) cb(true);
    } else {

      if (cb != undefined) cb(false);
    }

    return r;
  };

  remove(_room) {
    let r = _.findLast(this.rooms, {
      id: _room.id,
      type: _room.type
    });
    if (r != undefined) this.rooms.splice(r)

    return r;
  };

}

module.exports.room = room;
module.exports.manager = manager;