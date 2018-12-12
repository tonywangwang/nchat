var nchat_plugin = function (host, room) {

  //判断是否如果已经在iframe中
  if (self != top) {
    return;
  }
  if (!host || !room || !room.id || !room.type || !room.name) return;
  var appendScriptFiles = function (url) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
    return script;
  }
  var appendStyleSheets = function (url) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
    return link;
  }

  var jsNode;
  if (!$)
    jsNode = appendScriptFiles(host + '/javascripts/jquery-1.11.1.js');
  if (!$.ui) {
    jsNode = appendStyleSheets(host + '/stylesheets/jquery-ui.min.css');
    jsNode = appendScriptFiles(host + '/javascripts/jquery-ui.min.js');
  }
  var initNchatPlugin = function () {
    var entry_img = $('<img></img>');
    entry_img.attr('src', host + '/images/chat_entry.png');
    entry_img.attr('style', 'width:78px;cursor:pointer;z-index: 9999; position: fixed ! important; right: 20px; bottom: 100px;');
    entry_img.attr('id', 'chat_entry_icon');
    entry_img.attr('title', 'Open N-Chat');
    $('body').append(entry_img);

    $('head').append(`<style type="text/css">
                    .nchatplugin-container {
                      position: fixed;
                      margin: auto;
                      top: 0;
                      right: 0;
                      bottom: 0;
                      left: 0;
                      height: 80%;
                      width: 60%;
                      max-width: 80vw;
                      border-radius: 10px;
                      overflow: hidden;
                      z-index:9997;
                    }
                    .nchatplugin-iframe {
                      position: absolute;
                      top: 0px;
                      left:0px;
                      height: 100%;
                      width: 100%;
                      border: 0;
                      border-radius: 10px;
                    }

                    @media screen and (max-width: 740px) {
                      .nchatplugin-container {
                        height: 100%;
                        width: 100%;
                        max-width: 100vw;
                      }
                    }
                    .nchatplugin-move {
                      position: absolute;
                      top: 0px;
                      left:0px;
                      background-color:#4D4948;
                      opacity:0.5;
                      z-index:9998;
                      width:100%;
                      height:100%;
                      cursor:move;
                      display:block;
                      color:#fff;
                      text-align:center;
                      font-size:32px;
                      padding-top:20%;
                    }
        
                    .nchatplugin-button-container {
                      position: absolute;
                      top: 70px;
                      right:5px;
                      /*margin:0 auto;*/
                      background-color:#4D4948;
                      opacity:0.5;
                      border-radius: 4px;
                      z-index:9999;
                      width:180px;
                      height:35px;
                      text-align:center;
                      padding-top:10px;
                      cursor:move;
                    
                    }
                    .nchatplugin-button-container:hover{
                      opacity:0.8;
                    }
                    .nchatplugin-button  {
                      margin:5px;
                      color:#fff;
                      opacity:1;
                      cursor:pointer;
                    }
                    </style>`);

    var nchat_plugin_container = $('<div class="nchatplugin-container"  id="nchatplugin_container" style="display:none"></div>');
    var nchat_plugin_iframe = $('<iframe id="nchatplugin_iframe" class="nchatplugin-iframe"></iframe>');
    var nchat_plugin_move = $(`<div class="nchatplugin-move">按住鼠标左键移动窗体<hr>拖拽窗体右下角可以调整大小<hr>双击窗体外可隐藏窗体</div>`);
    nchat_plugin_move.css('background', 'url("' + host + '/images/bg3.jpg") no-repeat 0 0px');
    var btn_container = $('<div class="nchatplugin-button-container"></div>');

    var btn_close = $('<span class="nchatplugin-button">关闭</span>');
    var btn_hide = $('<span class="nchatplugin-button">隐藏</span>');
    var btn_newWindow = $('<span class="nchatplugin-button">独立</span>');
    var btn_move = $('<span class="nchatplugin-button" >移动</span>');

    btn_container.append(btn_close);
    btn_container.append(btn_hide);
    btn_container.append(btn_newWindow);
    btn_container.append(btn_move);

    nchat_plugin_container.append(nchat_plugin_iframe);
    nchat_plugin_container.append(btn_container);
    nchat_plugin_container.append(nchat_plugin_move);
    $('body').append(nchat_plugin_container);

    entry_img.draggable();
    btn_container.draggable();
    nchat_plugin_container.resizable();
    nchat_plugin_container.draggable();

    nchat_plugin_iframe.load(function () {
      nchat_plugin_move.css('display', 'none');
    });

    $('body').dblclick(function () {
      $('#nchatplugin_container').css('display', 'none');
      entry_img.css('display', 'block');
    });

    entry_img.click(function () {
      $('#nchatplugin_container').css('display', 'block');

      if (!$('#nchatplugin_iframe').attr('src')) {
        nchat_plugin_move.css('display', 'block');
        $('#nchatplugin_iframe').attr('src', room._url);
      }

      entry_img.css('display', 'none');
    })

    btn_move.click(function () {
      nchat_plugin_move.css('display', 'block');
    });

    nchat_plugin_container.resize(function () {
      nchat_plugin_move.css('display', 'block');
    });

    /*nchat_plugin_move.mouseup(function () {
      nchat_plugin_move.css('display', 'none');
    })*/

    nchat_plugin_move.click(function () {
      nchat_plugin_move.css('display', 'none');
    });

    /* nchat_plugin_move.mouseout(function () {
       nchat_plugin_move.css('display', 'none');
     });*/

    btn_newWindow.click(function () {
      $('#nchatplugin_container').css('display', 'none');
      $('#nchatplugin_iframe').attr('src', null);
      entry_img.css('display', 'block');
      openRoomWindow();
    });

    btn_hide.click(function () {
      $('#nchatplugin_container').css('display', 'none');
      entry_img.css('display', 'block');
    });

    btn_close.click(function () {
      $('#nchatplugin_container').css('display', 'none');
      $('#nchatplugin_iframe').attr('src', null);
      entry_img.css('display', 'block');
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
          url: host + '/api/room',
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
  if (!jsNode)
    $(function () {
      initNchatPlugin()
    });
  else
    jsNode.onload = initNchatPlugin;
}