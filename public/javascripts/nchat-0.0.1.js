var chat; //for chatUI-d3.min.js required 

var chatRoom = function (container, server) {
    var room,user,users,roomUsers,rooms;
    var uploadArea = document.getElementById(container);
    var ui = chatUI(d3.select('#'+container));
    var socket = io.connect(server);
    chat = ui;
    
    var getCurrentUser = function () {

        /*var id = d3.select('meta[name=ajs-remote-user]').attr('content');
        var name = d3.select('meta[name=ajs-current-user-fullname]').attr('content');
        var url = 'http://apis.newegg.org/common/v1/domain/user/' + id + '/avatar';*/

        var id = 'jz15';
        var name = 'James';
        var url = 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2050638809,3513718617&fm=27&gp=0.jpg';

        return {
            id: id,
            name: name,
            iconUrl: url,
        };;
    }

    var getCurrentRoom = function () {

        /*var id = d3.select('meta[name=ajs-page-id]')== null?0:d3.select('meta[name=ajs-page-id]').attr('content');
        var name =   d3.select('meta[name=ajs-page-title]')== null?null:d3.select('meta[name=ajs-page-title]').attr('content'); 
        var url = id==0?d3.select('meta[name=ajs-base-url]').attr("content") :d3.select('meta[name=ajs-base-url]').attr("content") + '/pages/viewpage.action?pageId=' + id;
        var spaceName= d3.select('meta[name=ajs-space-name]')== null?null:d3.select('meta[name=ajs-space-name]').attr('content'); 
        var spaceKey= d3.select('meta[name=ajs-space-key]')== null?null:d3.select('meta[name=ajs-space-key]').attr('content'); */
        var id = getQueryString('roomid')!=null?getQueryString('roomid'):1;
        var type = getQueryString('roomtype')!=null?getQueryString('roomtype'):'standalone';
        var name = getQueryString('roomname')!=null?getQueryString('roomname'):'匿名';
        var url = '/?roomid='+id + '&roomname=' + name + '&roomtype=' + type;
        return {
            id: id,
            name: name,
            type: type,
            url: url
        };
    }

    var uploadFile = function (event) {
        EventUtil.preventDefault(event); //阻止事件的默认行为
        var formData = new FormData();
        formData.append("message", JSON.stringify({
            msg:'uploadfile',
            sender: user,
            room:room
        }));
        if (event.type == "drop") {
            var files = event.dataTransfer.files;
            for (var i = 0; i<files.length; i++) {
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
        if (!msg) return;

        socket.emit('message', {
            value: msg,
            sender: user,
            room:room
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

        socket.on('connect', function () {
            socket.emit('join', user, room);
        });

        socket.on('users', function (_users) {
            users = _users;
           //alert(users.length);
        });

        socket.on('room_users', function (_users) {
            roomUsers = _users;
            //alert(roomUsers.length);
        });

        socket.on('rooms', function (_rooms) {
            rooms = _rooms;
            //alert(rooms.length);
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
         room = getCurrentRoom();
         user = getCurrentUser();
        ui.showInput(sendMessage);
        socketEvent();
        EventUtil.addHandler(uploadArea, "dragenter", uploadFile);
        EventUtil.addHandler(uploadArea, "dragover", uploadFile);
        EventUtil.addHandler(uploadArea, "drop", uploadFile);
    }

    init();

}


function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}