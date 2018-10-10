var liAccount;

var isRecruterIntP = false;
var isSalesNavIntP = false;
var isDefIntP = false;

var person = {};
var maDefaultListId = 0;

var $select = $('#userPeopleSelect');
var countAttemptsGetEmail = 0;
var maxCountAttemptsGetEmail = 10;

var csrfToken = false; 

var e_e;

function checkAccountLimits(source) {
    liAccount = liAccounts.detectAccountAndCheckLimits(source.replace(/&quot;/ig, '"'), isDefIntP, isSalesNavIntP, isRecruterIntP);

    liAccounts.incLiCounter(liAccount, 1);
}

function showPersonInfo(person) {
    var $personInfoBody = $('#personInfoBody');

    function appendData(data, selector) {
        var $el = $personInfoBody.find(selector);
        if (data && $el) {
            $el.append(data);
        }
    }

    var $image = $personInfoBody.find('.js-contact-avatar > img');

    if (person.logo) {
        $image.attr('src', person.logo);
    } else {
        $image.attr('src', '../img/ghost_person.png');
    }

    appendData(person.name, '.js-contact-name');
    appendData(person.description, '.js-contact-description');
    if (person.current && person.current[0]) {
        appendData(person.current[0].company_name, '.js-contact-info');
    }
    $personInfoBody.find('.media').removeClass('hidden');
}

function localizeHtml() {
}

document.addEventListener('DOMContentLoaded', function () {
});

function showEmails(response) {
    var $emails = $('#emails');
    if (response && (response !== 'empty result')) {
        var emails = [];
        emails = response;
        if (emails.length > 0) {
            $emails.text('');
            for (var iNo = 0; iNo < emails.length; iNo++) {
                $emails.append('<img id="sendEmail' + iNo + '" name="' + emails[iNo] + '" style="cursor: pointer; margin-right: 2px;" src="../img/envelope_16.png" data-toggle="tooltip" title="Send email">' + emails[iNo] + '<br>');
                $('#sendEmail' + iNo).on('click', function () {
                    localStorage['emailsForSend'] = $(this)[0].name;
                    window.location.href = "../html/SendEmail.html";
                });
            }
        }
    } else {
        $emails.text('');
        $emails.text('Can\'t find emails');
    }
    $emails.removeClass('hidden');
    $emails.style = 'opacity: 1!important';
    toggleStatusClass('#emailsBlock', 'hidden');
}

function getPersonEmails(person) {
    if (person && (person.source_id_2 || person.source_id)) {

        var params = (person.source_id_2) ? ('sourceId2=' + person.source_id_2) : ('sourceId=' + person.source_id);

        $.post(getMainHost() + '/api/getPeopleContacts', params, function (response) {
            void 0;
            if (response.result) {
                if ((response.result == 2) || (response.result == 3)) {
                    countAttemptsGetEmail++;
                    if (countAttemptsGetEmail < maxCountAttemptsGetEmail) {
                        setTimeout(getPersonEmails, 5000, person);
                    } else {
                        if (response.contacts) {
                            showEmails(response.contacts);
                        } else {
                            showEmails('empty result');
                        }
                    }
                } else {
                    if (response.contacts) {
                        showEmails(response.contacts);
                    }
                }
            }
        });
    }
}

function parseResponsePerson(response) {
    var jsonObj = response;
    if (jsonObj && jsonObj.result) {
        localStorage['needUpdateMA'] = 1;
        toggleStatusClass('#personInfoBody > .media', 'saved');

        setTimeout(getPersonEmails, 5000, person);
    } else {
        toggleStatusClass('#personInfoBody > .media', 'error');
        if (jsonObj && jsonObj.message) {
            document.getElementById('errorMessage').innerText = jsonObj.message;
            show(document.getElementById('errorMessage'));

            if (jsonObj.code == 8) {
                document.getElementById('errorMessage').innerHTML = response.message.replace('link', '<a href="' + getMainHost() + '/pricing-plans" target="_blank">link</a>');
            }
        }
    }
}

function sendPerson() {
    void 0;

    if ($select.hasClass('hidden')) {
        var newUserList = $('#userPeopleInput').val();
    }

    if (newUserList) {
        void 0;
        var params = 'listName=' + newUserList + '&list=[' + encodeURIComponent(convertHtmlToText(JSON.stringify(person))) + ']';
    } else {
        void 0;
        var params = 'listId=' + maDefaultListId + '&list=[' + encodeURIComponent(convertHtmlToText(JSON.stringify(person))) + ']';
    }

    $.post(getMainHost() + '/api/createPeople', params, function (response) {
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
                            showAvailableLists(data, 'userPeopleSelect', maDefaultListId, update);
                            break;
                        }
                    }
                }
                parseResponsePerson(response);
                $(window).trigger('contactsSaved', [e_e])
            });
            getMAList('people', true);
        } else {
            parseResponsePerson(response);
            $(window).trigger('contactsSaved', [e_e])
        }

    });
}

function checkPrevAddedPeople(person, userLists) {
    var list = {};
    var ids = ['', ''];
    if (person.source_id) {
        ids[0] = person.source_id;
    }
    if (person.source_id_2) {
        ids[1] = person.source_id_2;
    }
    list[0] = ids;

    $.post(getMainHost() + '/api/getListsByPeoplesIds', list, function (response) {
        void 0;
        if (response.result && response.list && (response.list.length > 0)) {
            if (response.list[0]['disabled']) {
                $('#personInfoBody > .media').addClass('unsavable').prop('title', "This profile can not be saved due to owner's request");
                $('#sendPerson').attr('disabled', true);
            } else {
                toggleStatusClass('#personInfoBody > .media', 'saved');
                var savedListName = getListNameById(userLists, response.list[0]);
                void 0;
                $('#personInfoBody > .media').find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);

                maxCountAttemptsGetEmail = 1;
                getPersonEmails(person);
            }
        }
    });
}

function sendCurrent(e) {
    e.preventDefault();
    $(window).trigger('contactsSaving', [e]);
    toggleStatusClass('#personMedia', 'processing');
    e_e = e;

    var currentCompanies = [];
    var currentCompIds = [];
    var waitingCompaniesCount = 0;
    var processedCompaniesCount = 0;
    var bTransferred = false;

    function waitAndSend() {
        void 0;
        if (!bTransferred && (processedCompaniesCount == waitingCompaniesCount)) {
            bTransferred = true;
            if (currentCompanies.length > 0) {
                person.companies = currentCompanies;
            }
            sendPerson();
        }
    }

    function processWorks(workArray) {
        var workCount = 0;
        for (key in workArray) {
            if (workCount > 10) {
                break;
            }
            if ((workArray[key].source_id) && (currentCompIds.indexOf(workArray[key].source_id) < 0)) {
                currentCompIds.push(workArray[key].source_id);

                waitingCompaniesCount++;

                if (isRecruterIntP) {
                    var cUrl = 'https://www.linkedin.com/recruiter/company/' + workArray[key].source_id;
                } else {
                    if (isSalesNavIntP) {
                        if (csrfToken) {
                            var cUrl = 'https://www.linkedin.com/sales-api/salesApiCompanies/' + workArray[key].source_id;
                            cUrl += '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';

                            $.ajaxSetup({
                                headers: {
                                    'csrf-token': localStorage['csrfToken'],
                                    'x-restli-protocol-version': '2.0.0'
                                },
                                global: false,
                                type: 'GET'
                            })

                        } else {
                            var cUrl = 'https://www.linkedin.com/sales/accounts/insights?companyId=' + workArray[key].source_id;
                        }
                    } else {
                        var cUrl = 'https://www.linkedin.com/company/' + workArray[key].source_id + '/';
                    }
                }

                var jqxhr = $.get(cUrl, '', function (response) {
                    if (csrfToken) {
                        var resp = response;
                    } else {
                        var resp = response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
                    }
                    if (isRecruterIntP) {
                        var company = getCompanyInfo_C_R(resp);
                    } else {
                        if (isSalesNavIntP) {
                            var company = getCompanyInfo_C_S(resp);
                        } else {
                            var company = getCompanyInfo(resp);
                        }
                    }

                    if (company && company.name && company.source_id) {
                        void 0;
                        currentCompanies.push(company);
                    }

                    processedCompaniesCount++;
                    setTimeout(waitAndSend, 500);
                });

                jqxhr.fail(function () {
                    void 0;
                    processedCompaniesCount++;
                    setTimeout(waitAndSend, 500);
                });

                workCount++;
            }
        }
    }

    if (person && person.name) {
        if (person.current && (person.current.length > 0)) {
            var works = person.current;
            processWorks(works);
        }
        if (person.previous && (person.previous.length > 0)) {
            var works = person.previous;
            processWorks(works);
        }
        waitAndSend();
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

if (chrome.tabs) {
    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

        maDefaultListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;

        $select.on('dblclick', showUserPeopleInput);
        $('#addUserList').on('click', showUserPeopleInput);

        function showGetCheck(person) {
            if (person) {
                showPersonInfo(person);
                $(window).on('userListsLoaded', function (event, type, data, update) {
                    $('#sendPerson').on('click', sendCurrent);
                    showAvailableLists(data, 'userPeopleSelect', maDefaultListId, update);
                    maDefaultListId = $select.val();
                    localStorage[LS_LastPeopleListId] = maDefaultListId;

                    checkPrevAddedPeople(person, data);

                    if (!update) {
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
            }
        }

        localizeHtml();


        if ((tab.url.indexOf('/recruiter/') !== -1) && (tab.url.indexOf('profile') !== -1)) {
            isRecruterIntP = true;

            $.get(tab.url, '', function (response) {
                response = response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
                checkAccountLimits(response);
                person = getUserInfo_P_R(response);
                showGetCheck(person);
            });
        } else {
            if ((tab.url.indexOf('/sales/') !== -1) && ((tab.url.indexOf('profile') !== -1) || (tab.url.indexOf('/people/') !== -1))) {
                isSalesNavIntP = true;
                $.get(tab.url, '', function (response) {
                    response = response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
                    checkAccountLimits(response);
                    if ((tab.url.indexOf('/people/') !== -1)) {
                        person = getUserInfo_P_S2(response);
                        if (person) {
                            showGetCheck(person);
                        } else if (localStorage['csrfToken']) {
                            var fnd = tab.url.match(/sales\/people\/(.+?),(.+?),(.+?)(\?|$)/i);
                            if (fnd && fnd.length > 3) {
                                for (var iNo = 1; iNo < 4; iNo++) {
                                    if (fnd[iNo].length < 11) {
                                        var authToken = fnd[iNo];
                                    }
                                    if (fnd[iNo].length > 11) {
                                        var profileId = fnd[iNo];
                                    }
                                }
                                if (profileId && authToken) {
                                    var newUrl = 'https://www.linkedin.com/sales-api/salesApiProfiles/(';
                                    newUrl += 'profileId:' + profileId + ',authType:NAME_SEARCH,authToken:' + authToken + ')';
                                    newUrl += '?decoration=%28entityUrn%2CobjectUrn%2CpictureInfo%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cheadline%2CmemberBadges%2Cdegree%2CprofileUnlockInfo%2Clocation%2Cindustry%2CnumOfConnections%2CinmailRestriction%2CsavedLead%2CdefaultPosition%2CcontactInfo%2Csummary%2CcrmStatus%2CpendingInvitation%2Cunlocked%2CrelatedColleagueCompanyId%2CnumOfSharedConnections%2CshowTotalConnectionsPage%2CconnectedTime%2CnoteCount%2CmailboxThreadUrn%2CmessageSentCount%2CflagshipProfileUrl%2Cpositions*%2Ceducations*%2Ctags*~fs_salesTag%28entityUrn%2Ctype%2Cvalue%29%29';

                                    $.ajaxSetup({
                                        headers: {
                                            'csrf-token': localStorage['csrfToken'],
                                            'x-restli-protocol-version': '2.0.0'
                                        },
                                        global: false,
                                        type: 'GET'
                                    })

                                    void 0;
                                    $.get(newUrl, function (response) {
                                        person = getUserInfo_P_S2(response);
                                        if (person) {
                                            csrfToken = true;
                                            showGetCheck(person);
                                        }
                                    });
                                }
                            }
                        }
                    } else {
                        person = getUserInfo_P_S(response);
                        showGetCheck(person);
                    }
                });
            } else {
                isDefIntP = true;

                var jqxhr = $.get(tab.url, '', function (response) {
                    checkAccountLimits(response);
                    person = getUserInfo(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));

                    chrome.tabs.sendMessage(tab.id, {
                        method: 'getInnerHTML'
                    }, function (response) {
                        showGetCheck(person);
                    });
                });

                jqxhr.fail(function () {
                    void 0;
                    toggleStatusClass('#personInfoBody > .media', 'error');
                });

            }
        }

        $select.on('change', function () {
            maDefaultListId = $(this).val();
            localStorage[LS_LastPeopleListId] = maDefaultListId;
        })
    });
}

function getUser(data, url) {
    var person = getUserInfo(data);

    var fnd = data.match(regNewPersonName);
    if ((fnd) && (fnd.length > 1)) {
        if (!person || (!person.name) || (fnd[1] !== person.name)) {
            var jqxhr = $.get(url, '', function (response) {
                var person = getUserInfo(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
            });

            jqxhr.fail(function () {
                void 0;
                toggleStatusClass('#personInfoBody > .media', 'error');
            });
        }
    }
    return person;
}

function sendPersonA() {
    var params = 'noAuth=true&list=[' + encodeURIComponent(convertHtmlToText(JSON.stringify(person))) + '}';

    $.post(getMainHost() + '/api/createPeople', params, function (response) {
        void 0;
    });
}