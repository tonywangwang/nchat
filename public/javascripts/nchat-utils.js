var utils = {};

mermaid.initialize({
    startOnLoad: true
});

marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function (code, lan) {
        if (lan == 'mermaid') return '<div class="mermaid">' + htmlDecode(code) + '</div>';
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


utils.isJSON =function(str) {
    if (typeof str == 'string') {
        try {
            var obj = JSON.parse(str);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    return false;
}

utils.localTime = function (time) {
    if (time) return new Date(Number(time)).toLocaleString();
    return new Date().toLocaleString();
}

utils.reg_test = function (regStr, testStr) {
    return (new RegExp(regStr, 'igm')).test(testStr);
}

utils.reg_exec = function (regStr, testStr) {
    return (new RegExp(regStr, 'igm')).exec(testStr);
}

utils.translate = function (text, callback) {
    if (!text) return;
    var re = /[\u4e00-\u9fa5]/;
    var url = '/api/translate?text=' + text;
    if (re.test(text)) url = url + '&to=en'
    else url = url + '&to=zh-cn'
    $.get(url, function (result) {
        callback(result);
    }).fail(
        function () {
            callback(text)
        }
    );
}
utils.format_msg = function (str) {
    var _str = new String(str);
    //str = this.replace_url(str);
    _str = utils.replace_em(_str);
    _str = _str.split('\n').join('  \n');
    return utils.format_md(_str);
}

utils.format_md = function (str) {
    try{
        return marked(str);
    }
    catch(e){
        return str;
    }
}

utils.replace_em = function (str) {
    str = str.replace(/\[:([\u4e00-\u9fa5]+)\]/g, function () {
        return $('i[data-code=' + arguments[1] + ']').html().replace(/style="([^_]+)px"/g, '');
    });
    return str;
}

utils.replace_url = function (str) {
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

    _user = {
            id: 'tw13',
            name: 'Tony.J.Wang（Manager,MIS）',
            iconUrl: '/images/avatar/default.jpg'
        }

    callback(_user);
    return;

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


var swithFullScreen = function () {
    if (screen.height == window.innerHeight)
        cancelFullScreen();
    else
        launchFullScreen(window.document.documentElement);
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

var addBigPicArea = function () {
    b = $('<div id="bigPicView" style="position:absolute;display:none;">');
    bi = $('<img id="bigPic" class="img-thumbnail" style="max-width:50vw">');
    b.append(bi);
    b.appendTo('#container');
}
//展示
var showBigPic = function (filepath) {
    $('#bigPic').attr('src', filepath);
    $('#bigPicView').attr('style', 'position:absolute;display:block;left:50vw;top:30vh;z-index:999999');
}

//隐藏
var closeimg = function () {
    $("#bigPicView").attr('style', 'display:none');
}