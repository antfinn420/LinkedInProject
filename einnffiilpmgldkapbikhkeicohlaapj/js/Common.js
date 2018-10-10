const LS_LastPeopleListId = 'lastPeopleListId';
const LS_LastCompanyListId = 'lastCompanyListId';

const INTERFACE_DEF = 'Default';
const INTERFACE_SN = 'Sales Navigator';
const INTERFACE_REC = 'Recruiter';

function getMainHost() {
    if (!localStorage['host']) {
        localStorage['host'] = 'https://app.snov.io'
    }
    return localStorage['host'];
}

function getVersion(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', chrome.extension.getURL('../manifest.json'), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var manifest = JSON.parse(xhr.responseText);
            callback(manifest.version);
        }
    };
    xhr.send();
}

function addHeader() {
    var header = '' +
        '<div class="row">' +
        '<div class="col-xs-3">' +
        '    <a href="https://app.snov.io" target="_blank">' +
        '        <img src="../img/logo_snovio.png" alt="snov.io">' +
        '    </a>' +
        '</div>' +
        '<span class="col-xs-4" style="padding-left: 10px">' +
        '    <span id="activeTasks" class="hidden" title="Active background tasks" style="cursor: pointer; background-color: #5bae61; color: rgb(255, 255, 255); text-align: center; font-size: 11px; font-weight: bold;line-height: 1;border-radius: 2px;padding: 2px 4px">1</span>' +
        '    <img id="help" title="Help" src="../img/information.png" alt="Help" style="cursor: pointer;">' +
        '</span>' +
        '<div class="col-xs-5 text-right">' +
        '    <span id="userName" class="small text-muted"></span>' +
        '</div>'
    $('.main-header').append(header);

    $('#help').click(() => {
        chrome.tabs.create({
            url: 'https://snov.io/knowledgebase/knowledgebase/how-to-use-snovio-extension-for-chrome/'
        });
    });

    showActiveTasks();
}

function showActiveTasks() {
    chrome.runtime.sendMessage({
        type: 'getActiveTaskCount'
    }, function (response) {
        if (response && response.activeTaskCount && (response.activeTaskCount > 0)) {
            $('#activeTasks').text(response.activeTaskCount);
            $('#activeTasks').removeClass('hidden');
            $('#activeTasks').click(() => {
                window.location.href = "../html/backgroundTasks.html";
            });
        }
    });
}

function showUserName() {
    if (localStorage['userName']) {
        $('#userName').text(localStorage['userName']);
    } else {
        $('#userName').html('<a href="' + getMainHost() + '" target="_blank" class="btn btn-sm btn-success"><b>Log In</b></a>');
        $('.js-footer').addClass('hidden');
    }
}

function findDescrByRegEx(source, reg, html) {
    var sTemp = '';
    var fnd = source.match(reg);

    if ((fnd) && (fnd.length > 1)) {
        if (fnd[1]) {
            sTemp = fnd[1];
        } else {
            if (fnd[2]) {
                sTemp = fnd[2];
            }
        }

        sTemp = sTemp.trim();
        if (!html) {
            sTemp = convertHtmlToText(sTemp);
        }
        return sTemp;
    } else {
        return '';
    }
}

function getListNameById(listJson, id) {
    listJson = JSON.parse(listJson);
    var sResult = '';
    if (listJson && listJson.result && listJson.list) {
        for (var iNo = 0; iNo < listJson.list.length; iNo++) {
            if (id.indexOf(listJson.list[iNo].id) >= 0) {
                if (sResult.length > 0) {
                    sResult = sResult + ', ';
                }
                sResult = sResult + listJson.list[iNo].name;
            }
        }
    }
    return sResult;
}

function showAvailableLists(listJson, selectId, defaultListId, update) {
    showStars();

    list = document.getElementById(selectId);

    listJson = JSON.parse(listJson);

    if (listJson && listJson.result && listJson.list) {

        if (!update) {
            getUserBalance();

            if (!localStorage['userName']) {
                checkAuthenticationUpdate(function () {
                    showUserName();
                });
            } else {
                showUserName();
            }
        }

        $('#' + selectId).empty();
        for (var iNo = 0; iNo < listJson.list.length; iNo++) {
            if (defaultListId == 0) {
                defaultListId = listJson.list[iNo].id;
            }
            var option = document.createElement('option');
            option.text = listJson.list[iNo].name; 
            option.value = listJson.list[iNo].id;
            if (listJson.list[iNo].campaign) {
                option.style = 'font-weight: bold; color: #fda929;';
                option.text = option.text + ' (drip)';
            }
            list.add(option);

            if (defaultListId == listJson.list[iNo].id) {
                option.selected = true;
            }
        }

    } else {
        if ((listJson.result == 0) && (listJson.code == 1)) {
            localStorage['needUpdateUserLists'] = 1;

            localStorage['userName'] = '';
            showUserName();

            checkAuthenticationUpdate(function () {
                showUserName();
            });
        }
    }
}

function getMAList(type, forced) {
    var lastUpdateList = localStorage['lastUpdateList_' + type];
    var userList = localStorage['userList_' + type];

    if (!forced && (!localStorage['needUpdateUserLists'] || (localStorage['needUpdateUserLists'] == 0)) && lastUpdateList && userList && ((new Date().getTime() - lastUpdateList) < 86400000)) {
        $(window).trigger('userListsLoaded', [type, userList]);
    } else {
        var params = '';
        if (type) {
            params = 'type=' + type;
        }
        $.post(getMainHost() + '/api/getUserLists', params, function (response) {
            $(window).trigger('userListsLoaded', [type, response, forced]);

            if (response.result || ((typeof response === 'string') && JSON.parse(response).result)) {
                localStorage['userList_' + type] = response;
                localStorage['lastUpdateList_' + type] = (new Date().getTime());
                localStorage['needUpdateUserLists'] = 0;
            }

            void 0;
        });
    }
}


function show(elements, specifiedDisplay) {
    if (elements) {
        elements = elements.length ? elements : [elements];
        for (var index = 0; index < elements.length; index++) {
            elements[index].style.display = specifiedDisplay || 'block';
        }
    }
}

function hide(elements) {
    elements = elements.length ? elements : [elements];
    for (var index = 0; index < elements.length; index++) {
        elements[index].style.display = 'none';
    }
}

function toggleStatusClass(selector, className) {
    $(selector).removeClass('processing saved error').addClass(className);
}

function _showListLink($button) {
    var $link = $button.next('a');
    var listID = $button.closest('section').find('select').val();
    void 0;
    var section = $link.data('section');
    var url = getMainHost() + '/' + section + '/list/' + listID;
    $button.addClass('hidden');
    $link.attr('href', url).removeClass('hidden');
}

$(window).on('contactsSaving', function (event, e) {
    void 0;

    var $button = $(e.target);
    $button.button('loading');

});

$(window).on('contactsSaved contactsSavingReset', function (event, e) {
    var $button = $(e.target);
    void 0;
    setTimeout(function () {
        void 0;
        $button.button('reset').button('toggle');
        if (event.type == 'contactsSaved') {
            _showListLink($button);
        }
    }, 500);
});



function convertHtmlToText(inputText) {
    var returnText = inputText;
    if (returnText) {

        returnText = returnText.replace(/<br>/gi, "\n");
        returnText = returnText.replace(/<br\s\/>/gi, "\n");
        returnText = returnText.replace(/<br\/>/gi, "\n");





        returnText = returnText.replace(/ +(?= )/g, '');

        returnText = returnText.replace(/&nbsp;/gi, ' ');
        returnText = returnText.replace(/&amp;/gi, '&');
        returnText = returnText.replace(/&quot;/gi, '"');
        returnText = returnText.replace(/&lt;/gi, '<');
        returnText = returnText.replace(/&gt;/gi, '>');

        returnText = returnText.replace(/<.*?>/gi, '');
        returnText = returnText.replace(/%20/gi, ' ');
    }

    return (returnText);
}


function truncText(str, length) {
    var append = '';
    if (str.length > length) {
        append = '...';
    }
    return str.substring(0, length) + append;
}

var invalidLocalParts = ['the', '2', '3', '4', '123', '20info', 'aaa', 'ab', 'abc', 'acc', 'acc_kaz', 'account', 'accounts', 'accueil', 'ad', 'adi', 'adm', 'an', 'and', 'available',
    'b', 'c', 'cc', 'com', 'domain', 'domen', 'email', 'fb', 'foi', 'for', 'found', 'g', 'get', 'h', 'here', 'includes', 'linkedin', 'mail', 'mailbox', 'more', 'my_name', 'n',
    'name', 'need', 'nfo', 'ninfo', 'now', 'o', 'online', 'post', 'rcom.TripResearch.userreview.UserReviewDisplayInfo', 's', 'sales2', 'test', 'up', 'we', 'www', 'xxx', 'xxxxx',
    'y', 'username', 'firstname.lastname'
];

function prepareEmails(emails, domain) {
    var emailsNew = [];
    for (var iNo = 0; iNo < emails.length; iNo++) {
        var email = emails[iNo].toLowerCase().trim();

        if ((emailsNew.indexOf(email) < 0)) {
            if (domain) {
                if (email.indexOf(domain) < 1) {
                    continue;
                };
            }

            var ext = email.slice(-4);
            if ((ext === '.png') || (ext === '.jpg') || (ext === '.gif') || (ext === '.css')) {
                continue;
            }
            var ext2 = email.slice(-3);
            if ((ext2 === '.js')) {
                continue;
            }

            var newEmail = email.replace(/^(x3|x2|u003)[b|c|d|e]/i, '');
            newEmail = newEmail.replace(/^sx_mrsp_/i, '');
            newEmail = newEmail.replace(/^3a/i, '');
            if (newEmail !== email) {
                email = newEmail;
                if (email.search(/\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/i) == -1) {
                    continue;
                }
            }

            if (email.search(/(no|not)[-|_]*reply/i) != -1) {
                continue;
            };
            if (email.search(/mailer[-|_]*daemon/i) != -1) {
                continue;
            };
            if (email.search(/reply.+\d{5,}/i) != -1) {
                continue;
            };
            if (email.search(/\d{13,}/i) != -1) {
                continue;
            };
            if (email.indexOf('.crx1') > 0) {
                continue;
            };
            if (email.indexOf('nondelivery') > 0) {
                continue;
            };
            if (email.indexOf('@linkedin.com') > 0) {
                continue;
            };
            if (email.indexOf('@linkedhelper.com') > 0) {
                continue;
            };
            if (email.indexOf('feedback') > 0) {
                continue;
            };
            if (email.indexOf('notification') > 0) {
                continue;
            };

            var localPart = email.substring(0, email.indexOf('@'));
            if (invalidLocalParts.indexOf(localPart) !== -1) {
                continue;
            };

            if ((email !== '') && (emailsNew.indexOf(email) == -1)) {
                emailsNew.push(email);
            }
        }
    }

    return emailsNew;
}

function searchEmailsO(pageText, domain) {
    var emails = [];
    emails = pageText.match(/\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi);
    if (emails) {
        return prepareEmails(emails, domain);
    }
}

function getUserBalance(label) {
    $userBalanceBlock = $('#userBalanceBlock');
    $userBalance = $('#userBalance');
    $userBalanceBar = $('#userBalanceBar');
    void 0;
    $.post(getMainHost() + '/api/getUserBalance', function (response) {
        void 0;

        if (response.result && response.balance && response.pricing_plan) {
            localStorage['user_balance'] = response.balance;
            var percentsUsed = (100 * (response.pricing_plan - response.balance)) / response.pricing_plan;

            $userBalanceBlock.removeClass('hidden');
            $userBalanceBar.css('width', percentsUsed + '%');

            $userBalance.text('Credits used ' + (response.pricing_plan - response.balance).toFixed(1) + ' / ' + response.pricing_plan);

            if (percentsUsed > 70) {
                $userBalanceBar.addClass('progress-bar-warning');
            }

            if (response.balance < 1) {
                $userBalanceBar.addClass('progress-bar-danger');
            } else {
            }
        }
    });
}

function showStars() {
    if (document.getElementById('allStars')) {
        var impressions = 0;
        if (localStorage['impressions']) {
            impressions = localStorage['impressions'];
        }
        impressions++;
        localStorage['impressions'] = impressions;

        if ((impressions > 25) && ((impressions < 31)) || (impressions == 50) || (impressions == 100) || (impressions == 200) || (impressions == 500) || (impressions == 1000)) {
            if (localStorage['needShowRate'] == undefined) {
                localStorage['needShowRate'] = 1;
            }
        } else {
            if (localStorage['needShowRate'] == 1) {
                localStorage.removeItem('needShowRate');
            }
        }

        if (localStorage['needShowRate'] && localStorage['needShowRate'] == 1) {
            $contacts = $('.contacts-table');
            if ($contacts) {
                $contacts.css('max-height', '300px');
            }

            show(document.getElementById('allStars'));

            document.getElementById('star-5').addEventListener('click', function () {
                hide(document.getElementById('allStars'));
                localStorage['needShowRate'] = 0;

                var newURL = 'https://chrome.google.com/webstore/detail/snovio/einnffiilpmgldkapbikhkeicohlaapj/reviews';
                chrome.tabs.create({
                    url: newURL
                });

                localStorage['star'] = 5;
            });

            function badEval(star) {
                show(document.getElementById('badEval'));
                hide(document.getElementById('allStars'));
                localStorage['needShowRate'] = 0;
                localStorage['star'] = star;
            }

            document.getElementById('star-1').addEventListener('click', function () {
                badEval(1);
            });
            document.getElementById('star-2').addEventListener('click', function () {
                badEval(2);
            });
            document.getElementById('star-3').addEventListener('click', function () {
                badEval(3);
            });
            document.getElementById('star-4').addEventListener('click', function () {
                badEval(4);
            });
        }
    }
}

function randomInteger(min, max) {
    void 0;
    return Math.floor(Math.random() * (+max - +min + 1)) + +min;
}

function getCodeSize(size) {
    var code = '';
    size = size.replace(' employees');
    switch (size) {
        case '1-10':
            code = 'B';
            break;
        case '11-50':
            code = 'C';
            break;
        case '51-200':
            code = 'D';
            break;
        case '201-500':
            code = 'E';
            break;
        case '501-1000':
            ccode = 'F';
            break;
        case '1001-5000':
            code = 'G';
            break;
        case '5001-10,000':
            code = 'H';
            break;
        case '10,001+':
            code = 'I';
            break;

    }

    if (code === '') {
        var mas = size.split('-');

        if (mas.length === 2) {
            size = parseInt(mas[1].replace(',', '')) / parseInt(mas[0].replace(',', '').replace('+', ''));

            if ((size > 0) && (size < 11)) {
                code = 'B';
            } else
            if ((size > 10) && (size < 51)) {
                code = 'C';
            } else
            if ((size > 50) && (size < 201)) {
                code = 'D';
            } else
            if ((size > 200) && (size < 501)) {
                code = 'E';
            } else
            if ((size > 500) && (size < 1001)) {
                code = 'F';
            } else
            if ((size > 1000) && (size < 5001)) {
                code = 'G';
            } else
            if ((size > 5000) && (size < 10001)) {
                code = 'H';
            } else
            if (size > 10000) {
                code = 'I';
            } else
                code = 'A';
        } else {
            size = parseInt(mas[0].replace(',', '').replace('+', ''))
            if (size > 1000) {
                code = 'I';
            }
        }
    }

    return code;
}

! function (a) {
    "use strict";

    function b(a, b) {
        var c = (65535 & a) + (65535 & b),
            d = (a >> 16) + (b >> 16) + (c >> 16);
        return d << 16 | 65535 & c
    }

    function c(a, b) {
        return a << b | a >>> 32 - b
    }

    function d(a, d, e, f, g, h) {
        return b(c(b(b(d, a), b(f, h)), g), e)
    }

    function e(a, b, c, e, f, g, h) {
        return d(b & c | ~b & e, a, b, f, g, h)
    }

    function f(a, b, c, e, f, g, h) {
        return d(b & e | c & ~e, a, b, f, g, h)
    }

    function g(a, b, c, e, f, g, h) {
        return d(b ^ c ^ e, a, b, f, g, h)
    }

    function h(a, b, c, e, f, g, h) {
        return d(c ^ (b | ~e), a, b, f, g, h)
    }

    function i(a, c) {
        a[c >> 5] |= 128 << c % 32, a[(c + 64 >>> 9 << 4) + 14] = c;
        var d, i, j, k, l, m = 1732584193,
            n = -271733879,
            o = -1732584194,
            p = 271733878;
        for (d = 0; d < a.length; d += 16) i = m, j = n, k = o, l = p, m = e(m, n, o, p, a[d], 7, -680876936), p = e(p, m, n, o, a[d + 1], 12, -389564586), o = e(o, p, m, n, a[d + 2], 17, 606105819), n = e(n, o, p, m, a[d + 3], 22, -1044525330), m = e(m, n, o, p, a[d + 4], 7, -176418897), p = e(p, m, n, o, a[d + 5], 12, 1200080426), o = e(o, p, m, n, a[d + 6], 17, -1473231341), n = e(n, o, p, m, a[d + 7], 22, -45705983), m = e(m, n, o, p, a[d + 8], 7, 1770035416), p = e(p, m, n, o, a[d + 9], 12, -1958414417), o = e(o, p, m, n, a[d + 10], 17, -42063), n = e(n, o, p, m, a[d + 11], 22, -1990404162), m = e(m, n, o, p, a[d + 12], 7, 1804603682), p = e(p, m, n, o, a[d + 13], 12, -40341101), o = e(o, p, m, n, a[d + 14], 17, -1502002290), n = e(n, o, p, m, a[d + 15], 22, 1236535329), m = f(m, n, o, p, a[d + 1], 5, -165796510), p = f(p, m, n, o, a[d + 6], 9, -1069501632), o = f(o, p, m, n, a[d + 11], 14, 643717713), n = f(n, o, p, m, a[d], 20, -373897302), m = f(m, n, o, p, a[d + 5], 5, -701558691), p = f(p, m, n, o, a[d + 10], 9, 38016083), o = f(o, p, m, n, a[d + 15], 14, -660478335), n = f(n, o, p, m, a[d + 4], 20, -405537848), m = f(m, n, o, p, a[d + 9], 5, 568446438), p = f(p, m, n, o, a[d + 14], 9, -1019803690), o = f(o, p, m, n, a[d + 3], 14, -187363961), n = f(n, o, p, m, a[d + 8], 20, 1163531501), m = f(m, n, o, p, a[d + 13], 5, -1444681467), p = f(p, m, n, o, a[d + 2], 9, -51403784), o = f(o, p, m, n, a[d + 7], 14, 1735328473), n = f(n, o, p, m, a[d + 12], 20, -1926607734), m = g(m, n, o, p, a[d + 5], 4, -378558), p = g(p, m, n, o, a[d + 8], 11, -2022574463), o = g(o, p, m, n, a[d + 11], 16, 1839030562), n = g(n, o, p, m, a[d + 14], 23, -35309556), m = g(m, n, o, p, a[d + 1], 4, -1530992060), p = g(p, m, n, o, a[d + 4], 11, 1272893353), o = g(o, p, m, n, a[d + 7], 16, -155497632), n = g(n, o, p, m, a[d + 10], 23, -1094730640), m = g(m, n, o, p, a[d + 13], 4, 681279174), p = g(p, m, n, o, a[d], 11, -358537222), o = g(o, p, m, n, a[d + 3], 16, -722521979), n = g(n, o, p, m, a[d + 6], 23, 76029189), m = g(m, n, o, p, a[d + 9], 4, -640364487), p = g(p, m, n, o, a[d + 12], 11, -421815835), o = g(o, p, m, n, a[d + 15], 16, 530742520), n = g(n, o, p, m, a[d + 2], 23, -995338651), m = h(m, n, o, p, a[d], 6, -198630844), p = h(p, m, n, o, a[d + 7], 10, 1126891415), o = h(o, p, m, n, a[d + 14], 15, -1416354905), n = h(n, o, p, m, a[d + 5], 21, -57434055), m = h(m, n, o, p, a[d + 12], 6, 1700485571), p = h(p, m, n, o, a[d + 3], 10, -1894986606), o = h(o, p, m, n, a[d + 10], 15, -1051523), n = h(n, o, p, m, a[d + 1], 21, -2054922799), m = h(m, n, o, p, a[d + 8], 6, 1873313359), p = h(p, m, n, o, a[d + 15], 10, -30611744), o = h(o, p, m, n, a[d + 6], 15, -1560198380), n = h(n, o, p, m, a[d + 13], 21, 1309151649), m = h(m, n, o, p, a[d + 4], 6, -145523070), p = h(p, m, n, o, a[d + 11], 10, -1120210379), o = h(o, p, m, n, a[d + 2], 15, 718787259), n = h(n, o, p, m, a[d + 9], 21, -343485551), m = b(m, i), n = b(n, j), o = b(o, k), p = b(p, l);
        return [m, n, o, p]
    }

    function j(a) {
        var b, c = "";
        for (b = 0; b < 32 * a.length; b += 8) c += String.fromCharCode(a[b >> 5] >>> b % 32 & 255);
        return c
    }

    function k(a) {
        var b, c = [];
        for (c[(a.length >> 2) - 1] = void 0, b = 0; b < c.length; b += 1) c[b] = 0;
        for (b = 0; b < 8 * a.length; b += 8) c[b >> 5] |= (255 & a.charCodeAt(b / 8)) << b % 32;
        return c
    }

    function l(a) {
        return j(i(k(a), 8 * a.length))
    }

    function m(a, b) {
        var c, d, e = k(a),
            f = [],
            g = [];
        for (f[15] = g[15] = void 0, e.length > 16 && (e = i(e, 8 * a.length)), c = 0; 16 > c; c += 1) f[c] = 909522486 ^ e[c], g[c] = 1549556828 ^ e[c];
        return d = i(f.concat(k(b)), 512 + 8 * b.length), j(i(g.concat(d), 640))
    }

    function n(a) {
        var b, c, d = "0123456789abcdef",
            e = "";
        for (c = 0; c < a.length; c += 1) b = a.charCodeAt(c), e += d.charAt(b >>> 4 & 15) + d.charAt(15 & b);
        return e
    }

    function o(a) {
        return unescape(encodeURIComponent(a))
    }

    function p(a) {
        return l(o(a))
    }

    function q(a) {
        return n(p(a))
    }

    function r(a, b) {
        return m(o(a), o(b))
    }

    function s(a, b) {
        return n(r(a, b))
    }

    function t(a, b, c) {
        return b ? c ? r(b, a) : s(b, a) : c ? p(a) : q(a)
    }
    "function" == typeof define && define.amd ? define(function () {
        return t
    }) : a.md5 = t
}(this);