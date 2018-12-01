var nchat = function (host, room) {

  if (!host || !room || !room.id || !room.type || !room.name) return;

  var ediv = $('<div></div>');
  ediv.attr('style', 'z-index: 9999; position: fixed ! important; right: 20px; bottom: 100px;');

  var eimg = $('<img></img>');
  eimg.attr('src', host + '/images/chat_entry.png');
  eimg.attr('style', 'width:78px;cursor:pointer');
  eimg.attr('id', 'chat_entry_icon');
  eimg.attr('title', 'Open N-Chat');
  eimg.on('click', function () {
    $('#nchat_container').css('display', 'block');
    $('#nchat_frame').attr('src', room._url);
  })
  ediv.append(eimg);
  $('body').append(ediv);


  $('head').append('<style type="text/css">' +
    "\n.stackedit-no-overflow {\n  overflow: hidden;\n}\n\n.stackedit-container {\n  background-color: rgba(160, 160, 160, 0.5);\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 9999;\n}\n\n.stackedit-hidden-container {\n  position: absolute;\n  width: 10px;\n  height: 10px;\n  left: -99px;\n}\n\n.stackedit-iframe-container {\n  background-color: #fff;\n  position: absolute;\n  margin: auto;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  height: 85%;\n  width: 80%;\n  max-width: 1280px;\n  border-radius: 2px;\n  overflow: hidden;\n}\n\n.stackedit-iframe {\n  position: absolute;\n  height: 100%;\n  width: 100%;\n  border: 0;\n  border-radius: 2px;\n}\n\n@media (max-width: 740px) {\n  .stackedit-iframe-container {\n    height: 100%;\n    width: 100%;\n    border-radius: 0;\n  }\n\n  .stackedit-iframe {\n    border-radius: 0;\n  }\n}\n\n.stackedit-close-button {\n  position: absolute !important;\n  box-sizing: border-box !important;\n  width: 38px !important;\n  height: 36px !important;\n  margin: 4px !important;\n  padding: 0 4px !important;\n  text-align: center !important;\n  vertical-align: middle !important;\n  text-decoration: none !important;\n}\n" +
    '</style>')

  var iframe = $('<iframe id="nchat_frame" class="stackedit-iframe"></iframe>');
  var idiv2 = $('<div class="stackedit-iframe-container"></div>');
  idiv3 = $('<div style="position:absolute;left:400px;top:15px;z-index:10000;cursor:pointer"></div>');
  idiv3.append('<img src="' + host + '/images/chat_entry.png" title="Open to new Window" width="30px">')
  idiv2.append(idiv3);
  idiv2.append(iframe);

  var idiv = $('<div class="stackedit-container" style="display:none" id="nchat_container"></div>');
  idiv.append(idiv2);
  $('body').append(idiv);

  idiv3.click(function () {
    $('#nchat_container').css('display', 'none');
    openRoomWindow();
  });

  idiv.click(function () {
    $('#nchat_container').css('display', 'none');
  });

  room._url = host +
    '/?roomid=' + room.id +
    '&roomname=' + encodeURIComponent(room.name) +
    '&roomtype=' + room.type +
    (room.iconUrl ? '&iconUrl=' + room.iconUrl : '') +
    (room.origin ? '&origin=' + room.origin : '') +
    (room.private ? '&private=' + room.private : '');

  var openRoomWindow = function () {
    if (window.location.protocol == 'https:') {
      window.open(room._url);
    } else {
      $.ajax({
        type: "post",
        url: host + '/room',
        data: JSON.stringify(room),
        async: true,
        contentType: 'application/json',
        success: function (r) {
          console.log('N-Chat:提交房间注册信息成功');
          window.open(host + r.url);
        },
        error: function (r) {
          console.log('N-Chat:提交N-Chat房间注册信息失败');
        }
      });
    }
  }
}