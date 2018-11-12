const fs = require("fs");
const path = require('path');
const uuidv1 = require('uuid/v1');

class file {
  constructor() {
    this.uploadFolder = path.join(__dirname, 'public/uploadfiles/');
    this.upload = this.upload.bind(this);
    this._upload = this._upload.bind(this);
    this._createFolder = this._createFolder.bind(this);
  }

  upload(files, callback) {
    this.uploadFolder = this.uploadFolder + (new Date()).toLocaleDateString();
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
      url: '/uploadfiles/' + (new Date()).toLocaleDateString() + '/' + filename
    }

  }

  _createFolder() {
    try {
      fs.accessSync(this.uploadFolder);
    } catch (e) {
      fs.mkdirSync(this.uploadFolder);
    }
  };
}

module.exports = file;