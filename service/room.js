const _ = require('lodash');
const uuidv1 = require('uuid/v1');
const config = require('./config').get();
let um = require('./user').manager;

class manager {
  constructor(_io, _app) {
    this.io = _io;
    this.app = _app;
    this.rooms = [];
    this.add = this.add.bind(this);
    this.get = this.get.bind(this);
    this.remove = this.remove.bind(this);
    this.sendRooms = this.sendRooms.bind(this);
    this.isInAnyRoom = this.isInAnyRoom.bind(this);
    this.getById = this.getById.bind(this);
    this.removeUserBySid = this.removeUserBySid.bind(this);
    this.rest = this.rest.bind(this);
    this.init = this.init.bind(this);
  }

  init(){
    config.room.default.forEach(_room => {
      this.add(_room);
    });
  }

  rest() {
    if(!this.app) return; 
    this.app.post('/api/room',  (req, res)=> {
      let room = req.body;
      room = this.add(room);
      res.json(room);
    });

    this.app.get('/api/room',  (req, res) => {
      if (!req.query['roomid'] || !req.query['roomtype'])
        res.end();
      let room = {
        id: req.query['roomid'],
        type: req.query['roomtype']
      };
      room = this.get(room);
      res.json(room);
    });
  }

  get(_room) {
    return _.findLast(this.rooms, {
      id: _room.id,
      type: _room.type
    });
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

  sendRooms(_socket) {
    if (_socket != undefined)
      _socket.emit('rooms', this.rooms);
    else
      this.io.emit('rooms', this.rooms)
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
    origin
  }) {
    this.id = id || uuidv1();
    this.name = name || 'N-Chat';
    this.desc = desc;
    this.type = type || 'standalone';
    this.url = url || `?roomid=${this.id}&roomtype=${this.type}`;
    this.iconUrl = iconUrl || '/images/' + this.type + '.png';
    this.origin = origin;
    this.socket_room = this.type + '_' + this.id;
    this.userManager = new um();
  }
}


module.exports.room = room;
module.exports.manager = manager;