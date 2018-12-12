const config = require('./service/config');
const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const fs = require("fs");

config.init('negConfig', startup)

function startup() {

  let server;

  if (config.get().https) {
    const privateKey = fs.readFileSync(path.join(__dirname, './cert/1583250_chat.newegg.space.key'), 'utf8');
    const certificate = fs.readFileSync(path.join(__dirname, './cert/1583250_chat.newegg.space.pem'), 'utf8');
    const credentials = {
      key: privateKey,
      cert: certificate
    };
    server = https.Server(credentials, app);
  } else
    server = http.Server(app);


    // view engine setup
    app.set('views', path.join(__dirname, 'view'));
    app.set('view engine', 'ejs');
    app.use(favicon(path.join(__dirname, 'public/images', 'favicon.png')));

  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: false
  }));
  
  if (process.env.ENV == 'PRD')
    app.use(express.static(path.join(__dirname, 'public'), {
      maxage: '1h'
    }));
  else
    app.use(express.static(path.join(__dirname, 'public')));

  const io = require('socket.io')(server);
  const nc = require('./service/nchat');
  let nchat = new nc(io, app);
  nchat.init();

  app.get('/',  (req, res)=> {
    res.render('nchat');
  });

  app.get('/bot',  (req, res)=> {
    res.render('bot');
  });


  const port = process.env.PORT || config.get().port || 80;
  server.listen(port, function () {
    console.log('N-Chat is listening on *:' + port + ' with ' + (config.get().https ? 'https' : 'http'));
  });

}