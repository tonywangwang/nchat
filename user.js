const _ = require('lodash');

class manager {
  constructor() {
    this.bot={
      id: 'xiaoen',
      name: '程序员鼓励师小恩',
      iconUrl: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3774486761,2283055156&fm=26&gp=0.jpg',
    };
    this.users = [];
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.removeBySid = this.removeBySid.bind(this);
  }
  
  add(_user,cb) {
    let u = _.findLast(this.users, {
      id: _user.id
    });

    if (u == undefined) {
      u = new user(_user);
      this.users.push(u);
      if(cb != undefined) cb(true);
    }
    else{

      if(cb != undefined) cb(false);
    }

    return u;
  };

  remove(_user) {
    let u = _.findLast(this.users, {
      id: _user.id
    });
    if (u != undefined) this.users.splice(u)

    return u;
  };

  removeBySid(sid) {
    let u = _.findLast(this.users, {
      sid: sid
    });

    if (u != undefined) this.users.splice(u)
    
    return u;
  };

  getById(_id)
  {
    return _.findLast(this.users, {
      id:_id
    });
  }


}

class user {
  constructor({
    id,
    name,
    desc,
    iconUrl,
    sid
  }) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.iconUrl = iconUrl;
    this.sid = sid;
    this.aciton = this.aciton.bind(this);
  }
  aciton() {}
}

module.exports.user = user;
module.exports.manager = manager;