function ParseResponce(response) {
    var jsonObj = JSON.parse(response);
    void 0;
    if (jsonObj) {
        if (jsonObj.result) {
        } else {
        }
    }
}

function LoginAttempt(login, password, remember) {
    var params = 'login=' + login + '&password=' + password + '&remember=' + remember;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', getMainHost() + '/api/login', true);
    xhr.overrideMimeType('text/xml');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            hide(document.getElementById('animate'));
            void 0;
            ParseResponce(xhr.responseText);
        }
    }
    xhr.send(params);
}

function clickHandler(e) {
    event.preventDefault();

    show(document.getElementById('animate'));

    LoginAttempt(
        document.getElementById('login').value,
        document.getElementById('password').value,
        1
    );
}

function localizeHtml() {

}

function validation() {



}

document.addEventListener('DOMContentLoaded', function () {

});

function parseCheckLogin(response) {
    var jsonObj = JSON.parse(response);
    if (jsonObj && jsonObj.result) {
        if (jsonObj.token) {
            chrome.cookies.set({
                "name": 'token',
                "url": getMainHost(),
                "value": jsonObj.token,
                "expirationDate": (new Date().getTime() / 1000) + 1800
            }, function (cookie) {
                void 0;
                void 0;
                void 0;
                void 0;
            });
        }
    }
    if (jsonObj.name && jsonObj.email) {
        window.location.href = '../html/Popup.html';
    }
}

function checkLogin(selector, token) {
    void 0;
    var params = '';
    if ((selector !== '') && (token !== '')) {
        params = 'selector=' + selector + '&token=' + token;
    }
    void 0;
    localStorage['selector'] = selector;
    localStorage['token'] = token;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', getMainHost() + '/api/checkAuth', true);
    xhr.withCredentials = true;
    xhr.overrideMimeType('text/xml');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            void 0;
            localStorage['checkAuth'] = xhr.responseText;
            parseCheckLogin(xhr.responseText);
        }
    };

    xhr.send(params);
}

chrome.tabs.getSelected(null, function (tab) {
    var selector = '';
    var token = '';

    window.location.href = '../html/Popup.html';

    chrome.cookies.get({ 'url': getMainHost(), 'name': 'selector' }, function (cookie) {
        if (cookie) {
            selector = cookie.value;
            chrome.cookies.get({ 'url': getMainHost(), 'name': 'token' }, function (cookie) {
                if (cookie) {
                    token = cookie.value;
                } else {
                }
                checkLogin(selector, token);
            });
        } else {
            checkLogin(selector, token);
        }
    });

});
