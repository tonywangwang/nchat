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
            iconUrl: 'http://apis.newegg.org/common/v1/domain/user/tw14/avatar'
        }

        login_ne(function (userInfo) {
            _user.id = userInfo.UserID;
            _user.name = userInfo.FullName;
            _user.iconUrl = userInfo.Avatar;

            d3.select("#user_icon")
                .attr('src', _user.iconUrl)
                .attr('title', _user.name)

            if (callback != undefined)
                callback(_user);
        });
    }

    var initCurrentRoom = function () {

        var id = getQueryString('roomid') != null ? getQueryString('roomid') : '19821028';
        var type = getQueryString('roomtype') != null ? getQueryString('roomtype') : 'standalone';
        var name = getQueryString('roomname') != null ? getQueryString('roomname') : 'N-Chat';
        var url = '/?roomid=' + id + '&roomname=' + name + '&roomtype=' + type;
        var iconUrl = '/images/' + type + '.png'

        var _room = {
            id: id,
            name: name,
            type: type,
            iconUrl: iconUrl,
            url: url
        };

        d3.select('title').html(name);
        d3.select("#room_name").html(name);
        d3.select("#room_desc").html('N-Chat Alpha Powered by Tony.J.Wang');
        d3.select("#room_icon")
            .attr('src', _room.iconUrl)
            .attr('title', _room.name)

        return _room;
    }

    var initRoomList = function (_rooms) {

        d3.select("#rooms").html('');

        d3.select("#rooms_count").style('margin-left', '10px').html(_rooms.length);

        _rooms.forEach(function (_room) {

            var li = d3.select("#rooms").append('li');

            li.append('img')
                .attr('src', _room.iconUrl)
                .attr('class', 'img-circle')
                .style('height', '30px')
                .style('width', '30px')
                .style('margin-right', '10px')
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

            if (_room.id == room.id && _room.type == room.type)
                d3.select("#room_icon").attr('src', _room.iconUrl);

        });
    }

    var initUserListInRoom = function (_users) {

        d3.select("#room_users").html('');

        d3.select("#room_users_count").style('margin-left', '10px').html(_users.length);

        _users.forEach(function (_user) {
            d3.select("#room_users")

            var li = d3.select("#room_users").append('li')

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
            value: msg,
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
                value: msg.value,
                class: msg.sender.id == user.id ? 'human' : 'bot',
                sender: msg.sender,
                time: msg.time,
                delay: 500
            });
        });

    }
    var init = function () {
        initCurrentUser(function (_user) {
            user = _user;
            ui.showInput(sendMessage);
            socketEvent();
            room = initCurrentRoom();
        });

        EventUtil.addHandler(uploadArea, "dragenter", uploadFile);
        EventUtil.addHandler(uploadArea, "dragover", uploadFile);
        EventUtil.addHandler(uploadArea, "drop", uploadFile);
    }

    window.onbeforeunload = function (event) {
        socket.disconnect();
    };

    d3.select('body').on('dblclick', swithFullScreen);

    init();
}


var getQueryString = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}

var login_confluence = function (callback) {

    var id = d3.select('meta[name=ajs-remote-user]').attr('content');
    var name = d3.select('meta[name=ajs-current-user-fullname]').attr('content');
    var url = 'http://apis.newegg.org/common/v1/domain/user/' + id + '/avatar';

    var _user = {
        id: id,
        name: name,
        iconUrl: url
    }

    callback(_user);
}

var login_ne = function (callback) {

    var tokenParam = getQueryString('t');

    var m_token = getCookie("loginToken") || tokenParam;

    if (m_token) {
        if (tokenParam)
            setCookie("loginToken", tokenParam);
        $.ajax({
            url: "http://apis.newegg.org/framework/v1/keystone/sso-auth-data",
            type: "POST",
            headers: {
                "Authorization": "Bearer giOjDe8n4nEm7qOw4SrRmgMHUgotaAjb7c7OnFQ0",
                "If-Modified-Since": "Mon, 26 Jul 1997 05:00:00 GMT",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
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
                setCookie("loginToken", null);
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
function swithFullScreen() {
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

function launchFullScreen(element) {  
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


 function cancelFullScreen() {  
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