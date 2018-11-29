const config = require('./config');
const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const fs = require("fs");
const file = require('./file');


config.init('negConfig', startup)

function startup() {

  let server;

  if (config.get().https) {
    const privateKey = fs.readFileSync(path.join(__dirname, './cert/private.pem'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, './cert/file.crt'), 'utf8');
    const credentials = {
      key: privateKey,
      cert: certificate
    };
    server = https.Server(credentials, app);
  } else
    server = http.Server(app);

  const io = require('socket.io')(server);

  const nc = require('./nchat');
  let nchat = new nc(io);

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(express.static(path.join(__dirname, 'public'),{maxage:'1d'}));

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  app.post('/room', function (req, res) {
    let room = req.body;
    room = nchat.roomManager.add(room);
    res.json(room);
  });

  app.get('/room', function (req, res) {
    if (!req.query['roomid'] || !req.query['roomtype'])
      res.end();
    let room = {
      id: req.query['roomid'],
      type: req.query['roomtype']
    };
    room = nchat.roomManager.get(room);
    res.json(room);
  });

  app.post("/uploadFile", multipart(), function (req, res) {
    let f = new file();
    let msg;
    f.upload(req.files, (d) => {
      msg = JSON.parse(req.body.message);
      msg.room = nchat.roomManager.add(msg.room);
      nchat.messager.send_File({
        msg: msg,
        url: d.url,
        name: d.name
      })
    });
    res.end();
  });

  const port = process.env.PORT || config.get().port || 80;
  server.listen(port, function () {
    console.log('N-Chat is listening on *:' + port);
  });

}