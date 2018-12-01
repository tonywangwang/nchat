var chat; //for chatUI-d3.min.js required 
var chatRoom = function (container, server) {
    var socket,stackedit, room, user, users, roomUsers, rooms, fav_rooms;
    var uploadArea = document.getElementById(container);
    var ui = chatUI(d3.select('#' + container));
    var nchat = {};
    nchat.room = room;
    chat = ui;

    var initCurrentUser = function (callback) {
        var _user = {
            id: 'tw11',
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

            d3.select('#room_type_icon')
                .attr('src', '/images/' + room.type + '.png')
                .attr('title', room.type)
                .attr('alt', room.type)
                .attr('class', 'img-circle')
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .style('margin-left', '10px')
                .style('height', '15px')
                .style('width', '15px')
                // .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            d3.select("#room_icon")
                .attr('src', room.iconUrl)
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .attr('onerror', 'this.src="/images/' + room.type + '.png";this.onerror=null')
                .attr('title', room.name);
            d3.select("#favicon").attr('href', room.iconUrl);
            if (room.origin) {
                d3.select('#origin_link').attr('href', room.origin);
                d3.select('#origin_link').attr('title', 'Go to Origin:' + room.name);
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
        d3.select("#rooms_count").style('margin-left', '5px').html(_rooms.length);

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
                .attr('src', '/images/' + _room.type + '.png')
                .attr('title', _room.type)
                .attr('alt', _room.type)
                .attr('class', 'img-circle')
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .style('height', '15px')
                .style('width', '15px')
                // .style('margin-right', '5px')
                .style('vertical-align', 'middle');

            div.append('img')
                .attr('src', _room.iconUrl)
                .attr('onerror', 'this.src="/images/' + _room.type + '.png";this.onerror=null')
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

        });

        initFavRoomList(nchat.getFavRooms(_rooms));

        return _rooms;
    }

    var initFavRoomList = function (_fav_rooms) {

        d3.select("#fav_rooms").html('');
        d3.select("#fav_rooms_count").style('margin-left', '5px').html(_fav_rooms.length);

        _.orderBy(_fav_rooms, [function (r) {
            return r.userManager != undefined ? r.userManager.users.length : 0
        }, 'name'], ['desc', 'asc']).forEach(function (_room) {

            var div = d3.select("#fav_rooms")
                .append('li')
                .append('a')
                .attr('href', '#')
                .append('div');

            div.append('img')
                .attr('src', '/images/' + _room.type + '.png')
                .attr('title', _room.type)
                .attr('alt', _room.type)
                .attr('class', 'img-circle')
                .attr('onmousemove', 'showBigPic(this.src)')
                .attr('onmouseout', 'closeimg()')
                .style('height', '15px')
                .style('width', '15px')
                .style('vertical-align', 'middle');

            div.append('img')
                .attr('src', _room.iconUrl)
                .attr('onerror', 'this.src="/images/' + _room.type + '.png";this.onerror=null')
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
                .html(_room.userManager != undefined ? _room.userManager.users.length : 0);

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

        d3.select("#room_users_count").style('margin-left', '5px').html(_users.length);

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

        d3.select("#users_count").style('margin-left', '5px').html(_users.length);

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
        },function(){mermaid.init()});
    };

    var socketEvent = function () {

        socket = io.connect(server);

        window.onbeforeunload = function (event) {
            socket.disconnect();
        };
        
        socket.on('connect', function () {
            socket.emit('join', user, room);
            d3.select("#user_status").style('background-color', 'green').html('online');
        });

        socket.on('disconnect', function () {
            d3.select("#user_status").style('background-color', 'brown').html('offline');
        });

        /* socket.on('reconnecting', function (attemptNumber) {
             d3.select("#user_status").style('background-color', 'chocolate').html('reconnect:'+ attemptNumber);
         });*/

        socket.on('statistics', function (statis) {
            d3.select("#statis").style('margin-left', '5px').html(statis.total_message_count);
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
            },function(){mermaid.init()});
        });
    }

    nchat.reconnect = function () {
        socket.connect();
    }

    nchat.disconnect = function () {
        socket.disconnect();
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

    var initMarkdown = function(){

        d3.select('#open_markdown').attr('onclick', 'nchat.openMarkdownEditor()');
    
        stackedit = new Stackedit();
        mermaid.initialize({
            startOnLoad:true
        });

    
        marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function (code, lan) {
                if (lan == 'mermaid') return '<div class="mermaid">' + htmlDecode(code) +'</div>';
                return hljs.highlightAuto(htmlDecode(code)).value;
            },
            pedantic: false,
            gfm: true,
            tables: true,
            breaks: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        });
    }
    
    var md_msg = {value:'',time:(new Date).getTime()};
    var _md_msg = {value:'',time:(new Date).getTime()};
    nchat.openMarkdownEditor = function () {

        var input = d3.select('#chat_input').node();
        stackedit.openFile({
            name: room.name + '_' + moment().utc().local().format("YYYYMMDDHHmmss"),
            content: {
                text: input.value
            }
        });

        stackedit.on('fileChange', (file) => {
            md_msg.value = file.content.text;
            md_msg.time = (new Date).getTime();
        });

        stackedit.on('close', (file) => {
           if(md_msg.value==_md_msg.value && md_msg.time -_md_msg.time<1000 ) return; //防止重复触发
            sendMessage(md_msg.value);
            _md_msg  = {value:md_msg.value,time:md_msg.time};

        });

    }

    var scrollToTopEvent = function()
    {
        $('#cb-flow').scroll(function () {
            var scrollTop = $('#cb-flow').scrollTop(); 
            if (scrollTop==0) {
                loadHistoryMsg();
            }
        });
    }

    var loadHistoryMsg = function(){
       
        var lastMsgTime =  $(_.take( _.sortBy($('div[data-time]'),function(el){
           return $(el).data('time');
        }))).data('time');

        $.get('/message?roomid=' + room.id + '&lastMsgTime=' + lastMsgTime,
        function (messages) {
            if (messages) {
                messages = _.orderBy(messages,['time'],['desc']);
                messages.forEach(function(msg){
                    ui.addBubble({
                        type: 'text',
                        value: format_msg(msg.value),
                        class: msg.sender.id == user.id ? 'human' : 'bot',
                        sender: msg.sender,
                        time: msg.time,
                        delay: 500,
                        isHistory:true
                    },function(){mermaid.init(); $('#cb-flow').scrollTop(40);});
                });
            }
        });
    }

    var init = function () {

        addBigPicArea(container);
        initMarkdown();
        scrollToTopEvent();

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