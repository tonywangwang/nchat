const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const path = require('path');
const io = require('socket.io')(server);
const multipart = require('connect-multiparty');
const nc = require('./nchat');
const file = require('./file');
const config = require('./config');

config.init('negConfig', startup)


function startup() {

  let nchat = new nc(io);

  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
  });

  app.post("/uploadFile", multipart(), function (req, res) {
    let f = new file();
    let msg;
    f.upload(req.files, (d) => {
      msg = JSON.parse(req.body.message);
      msg.value = '<img src="' + d.url + '" width="400px"/>';
      nchat.messager.send(msg)
    });
    res.end();
  });

  const port = process.env.PORT || config.get().port || 80;
  server.listen(port, function () {
    console.log('N-Chat is listening on *:' + port);
  });

}