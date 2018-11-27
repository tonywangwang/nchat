var chat; //for chatUI-d3.min.js required 

var chatRoom = function (container, server) {
    var socket, room, user, users, roomUsers, rooms, fav_rooms;
    var uploadArea = document.getElementById(container);
    var ui = chatUI(d3.select('#' + container));
    var nchat = {};
    nchat.room = room;
    chat = ui;


    var initCurrentUser = function (callback) {
        var _user = {
            id: 'tw9',
            name: 'Tony.J.Wang（Manager,MIS）',
            iconUrl: '/images/avatar/default.jpg'
        }

        /*d3.select("#user_icon")
             .attr('src', _user.iconUrl)
             .attr('title', _user.name);

         callback(_user);*/

        login_ne(function (userInfo) {
            _user.id = userInfo.UserID;
            _user.name = userInfo.FullName + ' (' + userInfo.Title + ')';
            _user.iconUrl = userInfo.Avatar;

            d3.select("#user_icon")
                .attr('src', _user.iconUrl)
                .attr('title', _user.name);

            if (callback != undefined)
                callback(_user);
        });

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
            //d3.select("#room_desc").html('N-Chat Alpha Powered by Tony.J.Wang');
            d3.select("#room_icon")
                .attr('src', room.iconUrl)
                .attr('title', room.name);
            d3.select("#favicon").attr('href', room.iconUrl);
            if (room.origin && room.type != 'stanalone') {
                d3.select('#origin_link').attr('href', room.origin);
                d3.select('#origin_link').attr('title', 'Go to Origin');
                d3.select('#origin_link').attr('target', '_blank');
            } else
                d3.select('#origin_link').attr('href', '#');
        }
    }


    var createRoom = function (_room, callback) {
        $.ajax({
            type: "post",
            url: '//' + window.location.host + '/room',
            data: JSON.stringify(_room),
            async: true,
            contentType: 'application/json',
            success: function (r) {
                console.log('提交房间注册信息成功');
                if (callback) callback(r);
            },
            error: function (r) {
                console.log('提交房间注册信息失败');
                if (callback) callback(r);
            }
        });
    }

    var initRoomList = function (_rooms) {

        d3.select("#rooms").html('');
        d3.select("#rooms_count").style('margin-left', '10px').html(_rooms.length);

        _.orderBy(_rooms, [function (r) {
            return r.userManager.users.length
        }, 'name'], ['desc', 'asc']).forEach(function (_room) {

            var div = d3.select("#rooms")
                .append('li')
                .append('a')
                .attr('href', _room.url)
                .attr('target', '_blank')
                .append('div');

            div.append('img')
                .attr('src', _room.iconUrl)
                .attr('class', 'img-circle')
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .style('height', '30px')
                .style('width', '30px')
                .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            div.append('a')
                .attr('href', _room.url)
                .attr('target', '_blank')
                .style('margin-right', '10px')
                .style('overflow', 'hidden')
                .attr('title', _room.name)
                .html(_room.name);

            div.append('span')
                .attr('class', 'badge')
                .html(_room.userManager.users.length);

            /*if (_room.id == room.id && _room.type == room.type) {
                room = _room;
                initCurrentRoom();
            }*/

        });

        initFavRoomList(nchat.getFavRooms(_rooms));

        return _rooms;
    }

    var initFavRoomList = function (_fav_rooms) {

        d3.select("#fav_rooms").html('');
        d3.select("#fav_rooms_count").style('margin-left', '10px').html(_fav_rooms.length);

        _.orderBy(_fav_rooms, [function (r) {
            return r.userManager.users.length
        }, 'name'], ['desc', 'asc']).forEach(function (_room) {

            var div = d3.select("#fav_rooms")
                .append('li')
                .append('a')
                .attr('href', '#')
                .append('div');

            div.append('img')
                .attr('src', _room.iconUrl)
                .attr('class', 'img-circle')
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .style('height', '30px')
                .style('width', '30px')
                .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            div.append('a')
                .attr('href', '#')
                .style('margin-right', '10px')
                .style('overflow', 'hidden')
                .attr('title', _room.name)
                .attr('onclick', 'nchat.openFavRoom(\'' + _room.id + '\',\'' + _room.type + '\')')
                .html(_room.name);

            div.append('span')
                .attr('class', 'badge')
                .html(_room.userManager.users.length);

            div.append('a')
                .attr('href', '#')
                .style('margin-left', '5px')
                .attr('onclick', 'nchat.removeFavRoom(\'' + _room.id + '\',\'' + _room.type + '\')')
                .html('[X]');

        });

        if (!d3.select('#add_fav_room').attr('onclick'))
            d3.select('#add_fav_room').attr('onclick', 'nchat.addFavRoom(nchat.room)');


        if (_.findLast(fav_rooms, {
                id: room.id,
                type: room.type
            }) != undefined) d3.select('#add_fav_room').style('display', 'none');

        else
            d3.select('#add_fav_room').style('display', 'block');

        return _fav_rooms;
    }

    nchat.addFavRoom = function (_fav_room) {
        if (localStorage.getItem('fav_rooms'))
            fav_rooms = JSON.parse(localStorage.getItem('fav_rooms'))
        else
            fav_rooms = [];

        _fav_room = _fav_room || room;
        if (_.findLast(fav_rooms, {
                id: _fav_room.id,
                type: _fav_room.type
            }) != undefined) return;

        fav_rooms.push(_fav_room);
        localStorage.setItem('fav_rooms', JSON.stringify(fav_rooms));

        initFavRoomList(nchat.getFavRooms(rooms));
    }

    nchat.removeFavRoom = function (id, type) {
        if (localStorage.getItem('fav_rooms'))
            fav_rooms = JSON.parse(localStorage.getItem('fav_rooms'))
        else
            fav_rooms = [];

        if (_.remove(fav_rooms, (_r) => {
                return _r.id == id && _r.type == type
            }).length == 0) return;

        localStorage.setItem('fav_rooms', JSON.stringify(fav_rooms));

        initFavRoomList(nchat.getFavRooms(rooms));
    }

    nchat.getFavRooms = function (_rooms) {
        if (localStorage.getItem('fav_rooms'))
            fav_rooms = JSON.parse(localStorage.getItem('fav_rooms'))
        else
            fav_rooms = [];
        if (_rooms)
            _rooms.forEach(function (r) {
                let _r = _.remove(fav_rooms, (_r) => {
                    return _r.id == r.id && _r.type == r.type
                });

                if (_r.length > 0)
                    fav_rooms.push(r);
            });

        return fav_rooms;
    }

    nchat.openFavRoom = function (id, type) {
        if (localStorage.getItem('fav_rooms'))
            fav_rooms = JSON.parse(localStorage.getItem('fav_rooms'))
        else
            fav_rooms = [];

        let _room = _.findLast(fav_rooms, {
            id: id,
            type: type
        });

        if (_room)
            createRoom(_room, function (r) {
                window.open(r.url);
            });

    }

    var initUserListInRoom = function (_users) {

        d3.select("#room_users").html('');

        d3.select("#room_users_count").style('margin-left', '10px').html(_users.length);

        _users.forEach(function (_user) {
            var div = d3.select("#room_users")
                .append('li')
                .append('a')
                .attr('href', '#')
                .append('div');

            div.append('img')
                .attr('src', _user.iconUrl)
                .attr('class', 'img-circle')
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .style('height', '30px')
                .style('width', '30px')
                .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            div.append('span').html(_user.name);

        });

        return _users;
    }

    var initUserList = function (_users) {
        d3.select("#users").html('');

        d3.select("#users_count").style('margin-left', '10px').html(_users.length);

        _users.forEach(function (_user) {

            var div = d3.select("#users")
                .append('li')
                .append('a')
                .attr('href', '#')
                .append('div');

            div.append('img')
                .attr('src', _user.iconUrl)
                .attr('class', 'img-circle')
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .style('height', '30px')
                .style('width', '30px')
                .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            div.append('span').html(_user.name);

        });

        return _users;

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

    nchat.bot = function (msgText) {
        sendMessage(msgText);
    }

    nchat.feedback = function () {
        let _room = {
            id: 'nchat_feedback',
            type: 'standalone'
        }
        createRoom(_room, function (r) {
            window.open(r.url);
        });
    }

    nchat.logout = function () {
        logout_ne();
    }

    var init = function () {

        addBigPicArea(container);

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

    return nchat;
}

var format_msg = function (str) {
    str = replace_url(str);
    str = replace_em(str);
    return str;
}

var replace_em = function (str) {
    str = str.replace(/\[:([\u4e00-\u9fa5]+)\]/g, function () {
        return $('i[data-code=' + arguments[1] + ']').html().replace(/style="([^_]+)"/g, '');
    });
    return str;
}

var replace_url = function (str) {
    str = str.replace(/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/g, function () {
        return '<a href="' + arguments[0] + '" target="_blank">' + arguments[0] + '</a>';
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
    var m_token = getCookie('loginToken') || tokenParam;

    if (m_token) {
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
                setCookie('loginToken', m_token);
                callback(data.UserInfo);
            },
            error: function () {
                setCookie('loginToken', '');
                if (tokenParam)
                    window.location = window.location.href.replace(tokenParam, '');
            }
        });
    } else {

        var m_url = "https://account.newegg.org/login?redirect_url=" + encodeURIComponent(window.location.href);
        window.location = m_url;
    }
}

var logout_ne = function () {
    setCookie("loginToken", "");
    var m_url = "https://account.newegg.org/logout?redirect_url=" + encodeURIComponent(window.location.href);
    window.location = m_url;
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

var isFullScreen = false;

var swithFullScreen = function () {
    if (isFullScreen)
        cancelFullScreen();
    else
        launchFullScreen(document.documentElement);
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

    isFullScreen = true;
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

    isFullScreen = false;
}

var htmlEncode = function (html) {
    return $("<div>").text(html).html();
}
var htmlDecode = function (encodedHtml) {
    return $("<div>").html(encodedHtml).text();
}

var addBigPicArea = function () {
    b = $('<div id="bigPicView" style="position:absolute;display:none;">');
    bi = $('<img id="bigPic" class="img-thumbnail" style="max-width:50vw">');
    b.append(bi);
    b.appendTo('body');
}
//展示
var showBigPic = function (filepath) {
    $('#bigPic').attr('src', filepath);
    $('#bigPicView').attr('style', 'position:absolute;display:block;left:50vw;top:50vh;z-index:999999');
}

//隐藏
var closeimg = function () {
    $("#bigPicView").attr('style', 'display:none');
}