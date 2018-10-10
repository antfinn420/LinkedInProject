var person = {};
var maDefaultListId = 0;

var $userPeopleSelect = $('#userPeopleSelect');
var countAttemptsGetEmail = 0;
var maxCountAttemptsGetEmail = 10;

var currentCompanies = [];
var waitingCompaniesCount = 0;
var processedCompaniesCount = 0;

var e_e;

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

function showEmails(response) {
    var $emails = $('#emails');
    if (response && (response !== 'empty result')) {
        var emails = [];
        emails = response;
        if (emails.length > 0) {
            $emails.text('');
            $emails.append(emails.join('<br>'));
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
    if (response && response.result) {
        localStorage['needUpdateMA'] = 1;
        toggleStatusClass('#personInfoBody > .media', 'saved');

        setTimeout(getPersonEmails, 5000, person);
    } else {
        toggleStatusClass('#personInfoBody > .media', 'error');
        if (response && response.message) {
            document.getElementById('errorMessage').innerText = response.message;
            show(document.getElementById('errorMessage'));
        }
    }
}

function sendPerson() {
    delete person.companies;
    var params = 'listId=' + maDefaultListId + '&list=[' + encodeURIComponent(convertHtmlToText(JSON.stringify(person))) + ']';
    $.post(getMainHost() + '/api/createPeople', params, function (response) {
        void 0;
        parseResponsePerson(response);
        $(window).trigger('contactsSaved', [e_e]);
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

function sendCompany(companies, callback) {
    var params = 'noAuth=true&list=' + encodeURIComponent(JSON.stringify(companies));
    $.post(getMainHost() + '/api/createCompany', params, function (response) {
        void 0;
        if (callback) {
            callback();
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
                sendCompany(currentCompanies, function () {
                    setTimeout(sendPerson, 2000);
                });
            } else {
                sendPerson();
            }
        }
    }

    if (person && person.name) {
        if (person.companies) {
            for (var iNo = 0; iNo < person.companies.length; iNo++) {
                var companyUrl = person.companies[iNo].replace('@', 'https://twitter.com/');

                waitingCompaniesCount++;
                $.get(companyUrl, function (response) {
                    var company = getUserInfoTwitter(response, true);
                    if (company && company.source_id) {
                        currentCompanies.push(company);

                        if (!person.current) {
                            person.current = [];
                        }

                        var job = {};
                        job.company_name = company.name;
                        job.position = '';
                        job.source_id = company.source_id;

                        person.current.push(job);
                    }
                    processedCompaniesCount++;
                    waitAndSend();
                }).fail(function () {
                    void 0;
                    processedCompaniesCount++;
                    waitAndSend();
                });
            }
        }

        waitAndSend();
    }
}

function localizeHtml() {
}

document.addEventListener('DOMContentLoaded', function () {
});

function showUserInfo() {
    void 0;

    showPersonInfo(person);

    $(window).on('userListsLoaded', function (event, type, data) {
        $('#sendPerson').on('click', sendCurrent);
        void 0;

        showAvailableLists(data, 'userPeopleSelect', maDefaultListId);
        maDefaultListId = $userPeopleSelect.val();
        localStorage[LS_LastPeopleListId] = maDefaultListId;

        checkPrevAddedPeople(person, data);

        $userPeopleSelect.on('change', function () {
            maDefaultListId = $(this).val();
            localStorage[LS_LastPeopleListId] = maDefaultListId;
        })
    });
    getMAList('people', true);
}

if (chrome.tabs) {
    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

        localizeHtml();

        maDefaultListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;

        chrome.tabs.sendMessage(tab.id, {
            method: 'getInnerHTML'
        }, function (response) {
            if (response) {
                person = getUserInfoTwitter(response.data.replace(/&quot;/ig, '"'));
                if (person && person.source_id_2 && (tab.url.indexOf(person.source_id_2.toLowerCase()) !== -1)) {
                    showUserInfo();
                } else {
                    $.get(tab.url, function (response) {
                        person = getUserInfoTwitter(response.replace(/&quot;/ig, '"'));
                        if (person && person.source_id_2 && (tab.url.toLowerCase().indexOf(person.source_id_2.toLowerCase()) !== -1)) {
                            showUserInfo();
                        }
                    });
                }
            } else {
                $(document.body).append('<div class="main-body contacts-table"><div class="alert alert-warning">Please try refreshing the page in your browser</div></div>');
                $('#personInfoBody').addClass('hidden');
                $('.main-footer').addClass('hidden');
            }
        });
    });
}