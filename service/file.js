const fs = require("fs");
const path = require('path');
const uuidv1 = require('uuid/v1');
const multipart = require('connect-multiparty');

class file {
  constructor(_app) {
    this.app = _app;
    this.uploadFolder = path.join(__dirname, '../public/uploadfiles/');
    this.uploads = this.uploads.bind(this);
    this._uploads = this._uploads.bind(this);
    this._upload = this._upload.bind(this);
    this._createFolder = this._createFolder.bind(this);
    this._getTodayString = this._getTodayString.bind(this);
    this.uploads = this.uploads.bind(this);
  }

  uploads(callback) {
    this.app.post("/api/file", multipart(),  (req, res)=> {
      let msg;
      this._uploads(req.files, (d) => {
        msg = JSON.parse(req.body.message);
        callback({
          msg: msg,
          url: d.url,
          name: d.name
        });
      });
      res.end();
    });

  }

  _uploads(files, callback) {
    this.uploadFolder = this.uploadFolder + this._getTodayString();
    this._createFolder(this.uploadFolder);
    let i = 0;
    for (let i = 0; i < Object.keys(files).length; i++) {
      let r = this._upload(files["file" + i]);
      callback(r);
    }
  }

  _upload(file) {

    let originalFileName = file.originalFilename || path.basename(file.path);
    let extName = path.extname(originalFileName);
    let filename = uuidv1() + extName;
    let targetPath = path.join(this.uploadFolder, filename);

    fs.createReadStream(file.path).pipe(fs.createWriteStream(targetPath));
    return {
      name: originalFileName,
      url: '/uploadfiles/' + this._getTodayString() + '/' + filename
    }

  }

  _createFolder() {
    try {
      fs.accessSync(this.uploadFolder);
    } catch (e) {
      fs.mkdirSync(this.uploadFolder);
    }
  };

  _getTodayString() {
    let date = new Date();
    let today = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
    return today;
  }
}

module.exports = file;