var search_id = 0;
var emailItemTemplate = $('#emailItemTemplate').html();
var emailItemTemplateValid = $('#emailItemTemplateValid').html();
var notFoundTemplate = $('#notFoundTemplate').html();

var emailList = {};
var maDefaultListId = 0;
var currentHost = '';
var search_id = false;
var listData;
var emailsOnPage = [];

var $domainEmails = $('#domainEmails');
var $userPeopleSelect = $('#userPeopleSelect');
var $select;

function localizeHtml() {
}

function parseResponseSendEmailList(response, emailList, e) {
    var result = true;
    try {
        if (response && response.result) {
            result = true;
        }
    } catch (err) {
        result = false;
    }

    for (var item in emailList) {
        if ($('#person_' + item).find('input')[0].checked) {
            if (result) {
                $('#person_' + item).addClass('saved').find('input').prop('checked', false);
            } else {
                $('#person_' + item).addClass('error');
            }
        }
    }

    if (result) {
        $(window).trigger('contactsSaved', [e]);
    }

};

function sendEmailList(e) {
    e.preventDefault();
    void 0;
    void 0;
    void 0;
    $(window).trigger('contactsSaving', [e]);

    var aEmails = [];
    for (var item in emailList) {
        if ($('#person_' + item).find('input')[0].checked) {
            aEmails.push(emailList[item].email);
        }
    }

    if ($select.hasClass('hidden')) {
        var newUserList = $('#userPeopleInput').val();
    }

    if (newUserList) {
        var params = 'listName=' + $('#userPeopleInput').val() + '&list={"list": ' + (JSON.stringify(aEmails)) + '}';
    } else {
        var params = 'listId=' + maDefaultListId + '&list={"list": ' + (JSON.stringify(aEmails)) + '}';
    }
    void 0;
    $.post(getMainHost() + '/api/createPeopleFromEmail', params, function (response) {
        void 0;

        if (response.result && newUserList) {
            $(window).on('userListsLoaded', function (event, type, data, update) {
                void 0;
                var listJson = JSON.parse(data);
                if (listJson && listJson.result && listJson.list) {
                    for (var iNo = 0; iNo < listJson.list.length; iNo++) {
                        if (newUserList == listJson.list[iNo].name) {
                            maDefaultListId = listJson.list[iNo].id;
                            localStorage[LS_LastPeopleListId] = maDefaultListId;
                            showAvailableLists(listData, 'userPeopleSelect', maDefaultListId, update);
                            break;
                        }
                    }
                }
                parseResponseSendEmailList(response, emailList, e, newUserList);
            });
            getMAList('people', true);
        } else {
            parseResponseSendEmailList(response, emailList, e);
        }
    });
}

function parseSearchEmailsInBing(response, domain) {
    response = response.replace(/<strong>/ig, '');
    response = response.replace(/<\/strong>/ig, '');
    var emails = searchEmailsO(response, domain);

    if (emails && emails.length > 0) {
        var iNo = 0;
        for (var item in emailList) {
            var index = emails.indexOf(emailList[item].email);
            if (index != -1) {
                emails.splice(index, 1);
            }
            iNo++;
        }

        for (var iJo = 0; iJo < emails.length; iJo++) {
            var obj = {};
            obj.email = emails[iJo];
            emailList['el' + iNo] = obj;
            iNo++;
        }

        _renderEmails(emailList);
    }
}

function searchEmailsInBing(domain) {
    $.get('http://www.bing.com/search?q="*%40' + domain + '"', function (response) {
        parseSearchEmailsInBing(response, domain);
    });
}

function completeSearchResults(search_id) {
    if (search_id) {
        _showCompleteSearchBtn(search_id);
    } else {
        if (!search_auth) {
            _showRevealEmailsLink();
        }
    }
}

function parseEmailList(response) {
    var jsonObj = JSON.parse(response);

    if (jsonObj) {
        search_id = jsonObj.search_id;
        search_auth = jsonObj.auth;
    }

    if ((jsonObj && jsonObj.result) || (emailsOnPage && (emailsOnPage.length > 0))) {
        if (((jsonObj.result == 1) && (jsonObj.list)) || (emailsOnPage && (emailsOnPage.length > 0))) {

            if (emailsOnPage && (emailsOnPage.length > 0)) {
                var countAdded = 0;
                for (var iNo = 0; iNo < emailsOnPage.length; iNo++) {
                    var bExist = false;
                    for (var item in jsonObj.list) {
                        if (emailsOnPage[iNo] == jsonObj.list[item].email) {
                            bExist = true;
                            break;
                        }
                    }

                    if (!bExist) {
                        var elem = {};
                        elem.email = emailsOnPage[iNo];
                        if (jsonObj && !jsonObj.list) {
                            jsonObj.list = [];
                            jsonObj.list.unshift(elem);
                        }
                        countAdded++;
                        if (countAdded == 3) {
                            break;
                        }
                    }
                }
            }

            for (var iNo = 0; iNo < jsonObj.list.length; iNo++) {
                emailList['el' + iNo] = jsonObj.list[iNo];
            }

            _renderEmails(emailList);

            if (emailList && (iNo < 10) && currentHost) {
                searchEmailsInBing(currentHost);
            }

        } else if (jsonObj.result == 'error') {
            $domainEmails.text(jsonObj.message);
        }
    } else {
        void 0;
        void 0;
        if (!currentHost) {
            $domainEmails.addClass('hidden');
            $(document.body).append('<div class="main-body contacts-table"><div class="alert alert-warning">' +
                'Use Snovio when you need to find email addresses:<br>' +
                '- as you browse websites<br>' +
                '- on social networks<br>' +
                '- while using Google Search<br>' +
                '<br>' +
                'Try our web app to verify emails, do technology stack lookup or send emails<br>' +
                '</div></div>');
        } else {
            $domainEmails.html(notFoundTemplate);
            searchEmailsInBing(currentHost);
        }
    }

    if (jsonObj) {
        void 0;
        void 0
        if ((jsonObj.auth == false) || !localStorage['userName']) {
            localStorage['userName'] = '';

            checkAuthenticationUpdate(function () {
                showUserName();
            });
        } else {
            showUserName();
        }
    }

}

function sendEmail() {
    var aEmails = [];
    for (var item in emailList) {
        if ($('#person_' + item).find('input')[0].checked) {
            aEmails.push(emailList[item].email);
        }
    }
    if (aEmails && (aEmails.length > 0)) {
        localStorage['emailsForSend'] = aEmails.join(',');
        window.location.href = "../html/SendEmail.html";
    }
}

function hideUserPeopleInput() {
    $('#userPeopleInput').addClass('hidden');
    $('#hideUserPeopleInput').addClass('hidden');
    $select.removeClass('hidden');
    $('#refreshPeopleSelect').removeClass('hidden');
    $('#addUserList').removeClass('hidden');
};

function showUserPeopleInput() {
    $('#userPeopleInput').removeClass('hidden');
    $select.addClass('hidden');
    $('#userPeopleInput').focus();
    $('#hideUserPeopleInput').removeClass('hidden');
    $('#refreshPeopleSelect').addClass('hidden');
    $('#addUserList').addClass('hidden');

    $('#hideUserPeopleInput').on('click', hideUserPeopleInput);
};

function _renderEmails(emailsResult) {
    void 0;
    $domainEmails.empty();

    for (var item in emailsResult) {
        if (emailsResult[item].verify_stat) {
            var $item = $(emailItemTemplateValid);
        } else {
            var $item = $(emailItemTemplate);
        }
        var $email = $item.find('.js-contact-email');
        $email.text(emailsResult[item].email);
        $item.attr('id', 'person_' + item);

        $domainEmails.append($item);
    }

    if (Object.keys(emailsResult).length > 8) {
        _addSelectAll('#domainEmails');
    }

    void 0;
    if ((maDefaultListId == 0) && (!$select)) {
        maDefaultListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;

        $select = $('#userPeopleSelect');

        $select.on('change', function () {
            maDefaultListId = $select.val();
            localStorage[LS_LastPeopleListId] = maDefaultListId;
        });


        $select.on('dblclick', showUserPeopleInput);
        $('#addUserList').on('click', showUserPeopleInput);

        $(window).on('userListsLoaded', function (event, type, data, update) {
            void 0;
            listData = data;

            showAvailableLists(listData, 'userPeopleSelect', maDefaultListId, update);
            maDefaultListId = $userPeopleSelect.val();
            localStorage[LS_LastPeopleListId] = maDefaultListId;

            if (!update) {
                checkPrevAddedEmails(emailList, listData);
                $btnSendEmailList = $('#btnSendEmailList');
                $btnSendEmailList.removeClass('hidden');
                $btnSendEmailList.on('click', sendEmailList);

                $('#sendEmail').removeClass('hidden');
                $('#sendEmail').on('click', sendEmail);

                $('#userPeopleSelect').removeClass('hidden');

                $('#refreshPeopleSelect').removeClass('hidden');
                $('#addUserList').removeClass('hidden');
                $('#refreshPeopleSelect').on('click', function () {
                    $('#refreshPeopleSelect').addClass('icon-refresh-animate');
                    getMAList('people', true);
                });
            }

            $('#refreshPeopleSelect').removeClass('icon-refresh-animate');
        });

        getMAList('people');
    } else {
        if (listData) {
            checkPrevAddedEmails(emailList, listData);
        }
    }

    completeSearchResults(search_id);
}

function checkPrevAddedEmails(emailList, userLists) {
    var list = {};
    for (var item in emailList) {
        list[item] = emailList[item].email;
    }

    void 0;
    $.post(getMainHost() + '/api/getListsPeopleByEmailAddresses', 'emails=' + JSON.stringify(list), function (response) {
        void 0;
        if ((response.result) && (response.list)) {
            for (var resp in response.list) {
                toggleStatusClass('#person_' + resp, 'saved');
                $('#person_' + resp).addClass('saved__already').find('input').prop('checked', false);

                var savedListName = getListNameById(userLists, response.list[resp]);
                $('#person_' + resp).addClass('saved__already').find('input').prop('checked', false);
                $('#person_' + resp).find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);
            }
        }
    });
}

function _showCompleteSearchBtn(search_id) {
    $('#completeSearchTemplate').removeClass('hidden');

    $('#btn-complete-search').attr('href', getMainHost() + '/plugin/history/' + search_id);


}

function _showRevealEmailsLink() {
    var templ = $('#revealLinkTemplate').html();
    $domainEmails.prepend($(templ));
}

function _addSelectAll(selector) {
    var $selectAll = $('#selectAllTemplate').html();
    $(selector).prepend($selectAll);

    $(selector).on('change', '[name="selectAll"]', function () {
        var $checkbox = $(this);

        var $items = $checkbox.closest('section').find('.js-list-item');
        var state = $checkbox.is(':checked');

        $items.each(function () {
            $(this).find('input').prop('checked', state);
        });
    })
}

function getEmailsByDomain(hostname) {
    var params = 'domain=' + hostname;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', getMainHost() + '/api/getContacts', true);
    xhr.overrideMimeType('text/xml');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                void 0;
                parseEmailList(xhr.responseText);
                getCompanyByDomain(hostname);
            } else {
                void 0;
                $domainEmails.html(notFoundTemplate);
            }
        }
    };
    xhr.send(params);
}

function getCompanyByDomain(hostname) {
    $.post(getMainHost() + '/api/getCompanyInfoByDomain', 'domain=' + hostname, function (response) {
        if ((response.result) && (response.name)) {
            $('#companyBlock').css('min-height', '0px');
            var $companyInfoBody = $('#companyInfoBody');
            $companyInfoBody.find('.js-contact-name').append(response.name);
            if (response.prospects) {
                for (item in response.prospects) {
                    var ch = response.prospects[item].trim().substr(-1);
                    if (ch !== '-') {
                        $companyInfoBody.find('.js-contact-description').append(response.prospects.join('<br>'));
                        $companyInfoBody.find('.js-contact-description').removeClass('hidden');
                    }
                }
            }
            $companyInfoBody.removeClass('hidden');
        }
    });
}

if (chrome.tabs) {
    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

        var parser = document.createElement('a');
        parser.href = tab.url;
        var hostname = parser.hostname;

        if (hostname && (hostname.indexOf('linkedin.com') !== -1)) {

            if (parser.pathname && (parser.pathname.indexOf('/recruiter/') !== -1)) {
                if (parser.pathname.indexOf('profile') !== -1) {
                    window.location.href = "../html/LinkedInPerson.html";
                } else {
                    if (parser.pathname.indexOf('search') !== -1) {
                        window.location.href = "../html/LinkedInSearch.html";
                    } else {
                        if (parser.pathname.indexOf('company') !== -1) {
                            window.location.href = "../html/LinkedInCompany.html";
                        }
                    }
                }
            } else {
                if (parser.pathname && (parser.pathname.indexOf('/sales/') !== -1)) {

                    if (parser.pathname.indexOf('/search') !== -1) {
                        window.location.href = "../html/LinkedInSearch.html";
                    } else {
                        if ((parser.pathname.indexOf('profile') !== -1) || ((parser.pathname.indexOf('/people/') !== -1))) {
                            window.location.href = "../html/LinkedInPerson.html";
                        } else {
                            if (parser.pathname.indexOf('sales/company') !== -1) {
                                window.location.href = "../html/LinkedInCompany.html";
                            }
                        }
                    }
                } else {
                    if (parser.pathname && ((parser.pathname.indexOf('search') !== -1) || (parser.pathname.indexOf('mynetwork') !== -1) || (parser.pathname.indexOf('people') !== -1))) {
                        window.location.href = '../html/LinkedInSearch.html';
                    } else if (parser.pathname && ((parser.pathname.indexOf('company') !== -1) || (parser.pathname.indexOf('school') !== -1))) {
                        window.location.href = "../html/LinkedInCompany.html";
                    } else if (parser.pathname && ((parser.pathname.indexOf('in') !== -1) || (parser.pathname.indexOf('/profile/') !== -1))) {
                        window.location.href = "../html/LinkedInPerson.html";
                    } else if (parser.pathname && ((parser.pathname.indexOf('members') !== -1) || (parser.pathname.indexOf('/groups/') !== -1))) {
                        window.location.href = "../html/LinkedInSearch.html";
                    } else if (parser.pathname && ((parser.pathname.indexOf('edu/alumni') !== -1))) {
                        window.location.href = "../html/LinkedInSearch.html";
                    } else {
                        $(document.body).append('<div class="main-body contacts-table"><div class="alert alert-warning">' +
                            'Snovio Chrome Extension works with Linkedin free and premium accounts on the following pages:<br>' +
                            '1) Search page<br>' +
                            "2) Person's profile page<br>" +
                            '3) Company profile page<br>' +
                            '4) Group members page<br>' +
                            'Start your search from any of the indicated pages to find emails.<br>' +
                            '</div></div>');
                        $('#domainEmails').addClass('hidden');
                    }
                }
            }

        } else {
            if (hostname && (hostname.indexOf('facebook.com') !== -1)) {
                window.location.href = "../html/Facebook.html";
            } else {
                if (hostname && (hostname.indexOf('twitter.com') !== -1)) {
                    if (parser.href.search(/twitter.com\/.+/i) !== -1) {
                        window.location.href = "../html/Twitter.html";
                    }
                    if ((parser.pathname.indexOf('search') !== -1) && (parser.href.indexOf('f=users' !== -1))) {
                        window.location.href = "../html/TwitterSearch.html";
                    }
                } else {
                    if (hostname && (hostname.indexOf('google') !== -1) && (parser.pathname.indexOf('search') !== -1)) {
                        window.location.href = '../html/LinkedInSearch.html';
                    } else {
                        if (hostname && (hostname.indexOf('yelp.com') !== -1)) {
                            if (parser.pathname && (parser.pathname.indexOf('biz') !== -1)) {
                                window.location.href = '../html/YelpCompany.html';
                            }
                        } else {
                            currentHost = tldjs.getDomain(tab.url);
                            void 0;

                            chrome.tabs.sendMessage(tab.id, {
                                method: 'getInnerHTML'
                            }, function (response) {
                                if (response) {
                                    emailsOnPage = searchEmailsO(response.data, currentHost);
                                }

                                getEmailsByDomain(parser.protocol + '//' + parser.host);
                            });
                        }
                    }
                }
            }
        }
    });
}

if (!chrome.tabs) {
    document.addEventListener('DOMContentLoaded', function () {
        parseEmailList(websiteEmailsResponce);
    });

}