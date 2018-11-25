var chat; //for chatUI-d3.min.js required 

var chatRoom = function (container, server) {
    var socket, room, user, users, roomUsers, rooms;
    var uploadArea = document.getElementById(container);
    var ui = chatUI(d3.select('#' + container));
    chat = ui;

    var initCurrentUser = function (callback) {
        var _user = {
            id: 'tw14',
            name: 'Tony.J.Wang',
            iconUrl: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2098054987,2271776465&fm=26&gp=0.jpg'
        }

        d3.select("#user_icon")
            .attr('src', _user.iconUrl)
            .attr('title', _user.name);

        callback(_user);

        /*  login_ne(function (userInfo) {
              _user.id = userInfo.UserID;
              _user.name = userInfo.FullName + ' (' + userInfo.Title + ')';
              _user.iconUrl = userInfo.Avatar;

              d3.select("#user_icon")
                  .attr('src', _user.iconUrl)
                  .attr('title', _user.name);

              if (callback != undefined)
                  callback(_user);
          });*/

    }

    var initCurrentRoom = function (callback) {

        var id = getQueryString('roomid') != null ? getQueryString('roomid') : '19821028';
        var type = getQueryString('roomtype') != null ? getQueryString('roomtype') : 'standalone';
        var name = getQueryString('roomname') != null ? getQueryString('roomname') : 'N-Chat';
        var url = '/?roomid=' + id + '&roomtype=' + type;
        var iconUrl = getQueryString('iconUrl') != null ? getQueryString('iconUrl') : '/images/' + type + '.png'
        var origin = getQueryString('origin');

        room = {
            id: id,
            type: type,
            name: name,
            url: url,
            iconUrl: iconUrl,
            origin: origin
        }

        renderRoom();

        $.get('/room?roomid=' + id + '&roomtype=' + type,
            function (data) {
                if (data) {
                    room = data;
                    renderRoom();
                }
            });

        function renderRoom() {
            d3.select('title').html(room.name);
            d3.select("#room_name").html(room.name);
            d3.select("#room_desc").html('N-Chat Alpha Powered by Tony.J.Wang');
            d3.select("#room_icon")
                .attr('src', room.iconUrl)
                .attr('title', room.name);

            if (room.origin && room.type != 'stanalone') {
                d3.select('#origin_link').attr('href', room.origin);
                d3.select('#origin_link').style('display', 'inline');
            } else
                d3.select('#origin_link').style('display', 'none');
        }
    }


    var createRoom = function (_room) {
        $.ajax({
            type: "post",
            url: '//' + window.location.host + '/room',
            data: JSON.stringify(_room),
            async: true,
            contentType: 'application/json',
            success: function (r) {
                console.log('提交房间注册信息成功');
            },
            error: function (r) {
                console.log('提交房间注册信息失败');
            }
        });

    }

    var initRoomList = function (_rooms) {

        d3.select("#rooms").html('');
        d3.select("#rooms_count").style('margin-left', '10px').html(_rooms.length);

        _.orderBy(_rooms, [function (r) {
            return r.userManager.users.length
        }, 'name'], ['desc', 'asc']).forEach(function (_room) {

            var li = d3.select("#rooms").append('li');

            li.style('margin-bottom', '2px');

            li.append('img')
                .attr('src', _room.iconUrl)
                .attr('class', 'img-circle')
                .style('height', '30px')
                .style('width', '30px')
                .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            li.append('a')
                .attr('href', _room.url)
                .attr('target', '_blank')
                .style('margin-right', '10px')
                .style('overflow', 'hidden')
                .attr('title', _room.name)
                .html(_room.name);

            li.append('span')
                .attr('class', 'badge')
                .html(_room.userManager.users.length);

            /*if (_room.id == room.id && _room.type == room.type) {
                room = _room;
                initCurrentRoom();
            }*/

        });
    }

    var initUserListInRoom = function (_users) {

        d3.select("#room_users").html('');

        d3.select("#room_users_count").style('margin-left', '10px').html(_users.length);

        _users.forEach(function (_user) {
            d3.select("#room_users")

            var li = d3.select("#room_users").append('li')

            li.style('margin-bottom', '2px');

            li.append('img')
                .attr('src', _user.iconUrl)
                .attr('class', 'img-circle')
                .style('height', '30px')
                .style('width', '30px')
                .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            li.append('span').html(_user.name);

        });
    }

    var initUserList = function (_users) {

    }

    var uploadFile = function (event) {
        EventUtil.preventDefault(event); //阻止事件的默认行为
        var formData = new FormData();
        formData.append("message", JSON.stringify({
            msg: 'uploadfile',
            sender: user,
            room: room
        }));
        if (event.type == "drop") {
            var files = event.dataTransfer.files;
            for (var i = 0; i < files.length; i++) {
                formData.append("file" + i, files[i]);
            }

            $.ajax({
                type: "post",
                url: "/uploadFile",
                headers: {
                    "Access-Control-Allow-Origin": "*"
                },
                data: formData,
                async: false,
                cache: false,
                contentType: false,
                processData: false, //此处指定对上传数据不做默认的读取字符串的操作
                success: function (rs) {
                    console.log(rs);
                },
                error: function (r) {
                    alert("文件上传出错！");
                }
            });
        }
    }

    var sendMessage = function (msg) {
        if (!msg || !socket) return;

        socket.emit('message', {
            value: msg,
            sender: user,
            room: room
        });

        ui.addBubble({
            type: 'text',
            value: format_msg(htmlEncode(msg)),
            class: 'human',
            sender: user,
            time: (new Date()).toLocaleTimeString(),
            delay: 0
        });
    };

    var socketEvent = function () {

        socket = io.connect(server);

        socket.on('connect', function () {
            socket.emit('join', user, room);
        });

        socket.on('users', function (_users) {
            users = initUserList(_users);
        });

        socket.on('room_users', function (_users) {
            roomUsers = initUserListInRoom(_users);
        });

        socket.on('rooms', function (_rooms) {
            rooms = initRoomList(_rooms);
        });

        socket.on('message', function (msg) {
            ui.addBubble({
                type: 'text',
                value: format_msg(msg.value),
                class: msg.sender.id == user.id ? 'human' : 'bot',
                sender: msg.sender,
                time: msg.time,
                delay: 500
            });
        });

    }

    var init = function () {

        window.onbeforeunload = function (event) {
            socket.disconnect();
        };

        d3.select('body').on('dblclick', swithFullScreen);

        initCurrentUser(function (_user) {
            user = _user;
            initCurrentRoom();
            ui.showInput(sendMessage);
            socketEvent();

        });

        EventUtil.addHandler(uploadArea, "dragenter", uploadFile);
        EventUtil.addHandler(uploadArea, "dragover", uploadFile);
        EventUtil.addHandler(uploadArea, "drop", uploadFile);
    }

    init();
}

var format_msg = function (str) {
    str = replace_url(str);
    str = replace_em(str);
    return str;
}

var replace_em = function (str) {
    str = str.replace(/\[:([\u4e00-\u9fa5]+)\]/g, function () {
        return $('i[data-code=' + arguments[1] + ']').html().replace(/style="([^_]+)"/g,'');
    });
    return str;
}

var replace_url= function(str){
   str = str.replace(/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g,function(){
        return '<a href="'+arguments[0]+'" target="_blank">'+arguments[0]+'</a>';
    });
    return str;
}

var getQueryString = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}


var login_ne = function (callback) {

    var tokenParam = getQueryString('t');

    var m_token = getCookie("loginToken") || tokenParam;

    if (m_token) {
        if (tokenParam)
            setCookie("loginToken", tokenParam);
        $.ajax({
            url: "//apis.newegg.org/framework/v1/keystone/sso-auth-data",
            type: "POST",
            headers: {
                "Authorization": "Bearer giOjDe8n4nEm7qOw4SrRmgMHUgotaAjb7c7OnFQ0",
                "If-Modified-Since": "Mon, 26 Jul 1997 05:00:00 GMT",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
                "Access-Control-Allow-Origin": "*"
            },
            dataType: 'json',
            data: {
                token: m_token
            },
            success: function (data) {
                window.currentUser = data.UserInfo;
                callback(data.UserInfo);
            },
            error: function () {
                setCookie("loginToken", "");
                alert("NE SSO login failed");
            }
        });
    } else {

        var m_url = "https://account.newegg.org/login?redirect_url=" + encodeURIComponent(window.location.href);
        window.location = m_url;
    }
}

var setCookie = function (key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (6 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

var getCookie = function (key) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    return keyValue ? keyValue[2] : null;
}

var swithFullScreen = function () {
    if (d3.select('#cb-container').attr('class') == 'col-md-9 column') {
        d3.select('#cb-container').attr('class', 'col-md-12 column');
        d3.select('#menu').style('display', 'none');
        launchFullScreen(document.documentElement);
    } else {
        d3.select('#cb-container').attr('class', 'col-md-9 column');
        d3.select('#menu').style('display', 'block');
        cancelFullScreen();
    }
}

var launchFullScreen = function (element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
}

var cancelFullScreen = function () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

var htmlEncode = function (html) {
    return $("<div>").text(html).html();
}
var htmlDecode = function (encodedHtml) {
    return $("<div>").html(encodedHtml).text();
}