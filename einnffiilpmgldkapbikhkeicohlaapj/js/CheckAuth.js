const mainHost = 'https://app.snov.io';
const mHost = 'app.snov.io';

var bStartedCheckAuth = false;

if (chrome.runtime) {
    chrome.runtime.onStartup.addListener(function () {
        checkAuthentication();
    });
    chrome.runtime.onInstalled.addListener(function () {
        checkAuthentication();
    });
}

function parseCheckLogin(response, callback) {
    function updateToken(token) {
        chrome.cookies.set({
            'name': 'token',
            'url': mainHost,
            'value': token,
            'expirationDate': (new Date() / 1000) + 3600 * 24 * 14
        }, function (cookie) {
            bStartedCheckAuth = false;
        });
    }

    var jsonObj = JSON.parse(response);
    if (jsonObj && jsonObj.result) {

        if (jsonObj.name) {
            if (jsonObj.name) {
                localStorage['userName'] = jsonObj.name;
            }
        }

        if (jsonObj.token) {
            chrome.cookies.set({
                'name': 'token',
                'url': mainHost,
                'value': jsonObj.token,
                'expirationDate': (new Date() / 1000) + 3600 * 24 * 14
            }, function (cookie) {
                if (!cookie) {
                    localStorage[new Date().toString() + '_cookies.set_ERROR'] = chrome.extension.lastError + '(' + chrome.runtime.lastError + ')';
                    localStorage[new Date().toString() + '_cookies.set_ERROR_token'] = jsonObj.token;
                    void 0;
                    void 0;
                    chrome.cookies.set({
                        'name': 'token',
                        'url': mainHost,
                        'value': jsonObj.token,
                        'expirationDate': (new Date() / 1000) + 3600 * 24 * 14
                    }, function (cookie) {
                        if (!cookie) {
                            setTimeout(updateToken, 1000, jsonObj.token);
                        } else {
                            bStartedCheckAuth = false;
                        }
                    });
                } else {
                    bStartedCheckAuth = false;
                }
            });
        } else {
            bStartedCheckAuth = false;
        }

        if (jsonObj.name) {
            if (callback) {
                callback();
            }
        }
    } else {
        chrome.cookies.remove({
            'name': 'token',
            'url': mainHost
        });
        chrome.cookies.remove({
            'name': 'selector',
            'url': mainHost
        });
        if (callback) {
            callback();
        }
    }
}

function checkLogin(selector, token, callback) {
    var params = '';
    if ((selector !== '') && (token !== '')) {
        params = 'selector=' + selector + '&token=' + token;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', mainHost + '/api/checkAuth', true);
    xhr.withCredentials = true;
    xhr.overrideMimeType('text/xml');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                parseCheckLogin(xhr.responseText, callback);
            } else {
                localStorage[new Date().toString() + '_checkAuthPost_ERROR'] = xhr.statusText;
            }
        }
    };

    xhr.send(params);
}

function checkAuthenticationUpdate(callback) {
    localStorage['userName'] = '';

    var selector = '';
    var token = '';

    if (chrome.cookies && !bStartedCheckAuth) {
        bStartedCheckAuth = true;

        chrome.cookies.get({ 'url': mainHost, 'name': 'selector' }, function (cookie) {
            if (cookie) {
                selector = cookie.value;
                chrome.cookies.get({ 'url': mainHost, 'name': 'token' }, function (cookie) {
                    if (cookie) {
                        token = cookie.value;
                    } else {
                        checkLogin(selector, token, callback);
                    }

                    if (selector && token) {
                        checkLogin(selector, token, callback);
                    }
                });
            } else {
                checkLogin(selector, token, callback);
            }
        });
    } else {
    }
};

function checkAuthentication() {
    localStorage['host'] = mainHost;
    localStorage['userName'] = '';

    var selector = '';
    var token = '';

    if (chrome.cookies && !bStartedCheckAuth) {
        bStartedCheckAuth = true;

        chrome.cookies.get({ 'url': mainHost, 'name': 'selector' }, function (cookie) {
            if (cookie) {
                selector = cookie.value;
                chrome.cookies.get({ 'url': mainHost, 'name': 'token' }, function (cookie) {
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
    } else {
    }
};

