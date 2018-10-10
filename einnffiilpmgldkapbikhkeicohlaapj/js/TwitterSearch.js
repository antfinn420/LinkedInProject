var companies = [];
var people = [];
var maListJsonCompany = {};
var maListJsonPeople = {};
var maDefaultPeopleListId = 0;
var index_num = 0;

var personTemplate = $('#personTemplate').html();
var companyTemplate = $('#companyTemplate').html();

$body = $('body');
$peopleList = $('#peopleList');
$countPeople = $('#countPeople');
$countSelectedPeople = $('#countSelectedPeople');

var peopleList = [];

var waitingPeopleCount = 0;
var processedPeopleCount = 0;

var currentCompanies = [];
var currentCompIds = [];
var waitingCompaniesCount = 0;
var processedCompaniesCount = 0;
var e_e;

function sendPeople_Search() {
    var params = 'listId=' + maDefaultPeopleListId + '&list=' + encodeURIComponent(convertHtmlToText(JSON.stringify(peopleList)));
    void 0;
    void 0;
    $.post(getMainHost() + '/api/createPeople', params, function (response) {
        localStorage['needUpdateMA'] = 1;

        void 0;


        if (response.result) {
            $('#warning2').addClass(' hidden');
            $(window).trigger('contactsSaved', [e_e]);
        } else {
            void 0;
        }
    });
}

function sendCompany_Search() {
    var params = 'noAuth=true&list=' + encodeURIComponent(JSON.stringify(currentCompanies));
    void 0;
    $.post(getMainHost() + '/api/createCompany', params, function (response) {
        void 0;
        setTimeout(sendPeople_Search, 3000);
    });
}

function checkCurrentCompaniesForSend() {
    void 0;

    if ((processedPeopleCount > 0) && (processedPeopleCount == waitingPeopleCount) && (processedCompaniesCount == waitingCompaniesCount)) {
        waitingCompaniesCount = 0;
        processedCompaniesCount = 0;

        sendCompany_Search(sendPeople_Search);
    }
}

function getPerson(person, cb) {
    if (person.source_id_2) {
        var profileLink = '';
        profileLink = 'https://twitter.com/' + person.source_id_2;

        var jqxhr = $.get(profileLink, '', function (response) {
            if (response) {
                var person2 = getUserInfoTwitter(response.replace(/&quot;/ig, '"'));

                if (person2 && person2.name) {

                    if (person2.companies) {
                        for (var iNo = 0; iNo < person2.companies.length; iNo++) {
                            var companyUrl = person2.companies[iNo].replace('@', 'https://twitter.com/');

                            waitingCompaniesCount++;
                            $.get(companyUrl, function (response) {
                                var company = getUserInfoTwitter(response, true);
                                if (company && company.source_id) {
                                    currentCompanies.push(company);

                                    if (!person2.current) {
                                        person2.current = [];
                                    }

                                    var job = {};
                                    job.company_name = company.name;
                                    job.position = '';
                                    job.source_id = company.source_id;

                                    person2.current.push(job);
                                }
                                processedCompaniesCount++;
                                checkCurrentCompaniesForSend();
                            }).fail(function () {
                                void 0;
                                processedCompaniesCount++;
                                checkCurrentCompaniesForSend();
                            });
                        }
                    }

                    peopleList.push(person2);
                    setTimeout(toggleStatusClass, 5000, '#person_' + person.index_num, 'saved');
                    if (cb) {
                        setTimeout(cb, 1000);
                    }
                } else {
                    toggleStatusClass('#person_' + person.index_num, 'error');
                    cb();
                }
            } else {
                toggleStatusClass('#person_' + person.index_num, 'error');
                cb();
            }

            processedPeopleCount++;
            checkCurrentCompaniesForSend();
        });
        jqxhr.fail(function (e) {
            void 0;
            toggleStatusClass('#person_' + person.index_num, 'error');
            cb();
            void 0;
            processedPeopleCount++;
            checkCurrentCompaniesForSend();
        });
    }
}

function sendPeopleDef(e) {
    e.preventDefault();
    $(window).trigger('contactsSaving', [e]);

    if (people) {
        var countSelected = 0;
        countSelected = $peopleList.find('.js-list-item input:checked').length;

        if (countSelected == 0) {
            $(window).trigger('contactsSavingReset', [e]);
            return undefined;
        }

        var bSent = false;

        e_e = e;
        $('#autoSearch').addClass(' hidden');
        $('#warning2').removeClass('hidden');


        for (var iNo = 0; iNo < people.length; iNo++) {
            selected = $('#person_' + people[iNo].index_num).find('input')[0].checked;
            if (selected) {
                toggleStatusClass('#person_' + people[iNo].index_num, 'processing');

                waitingPeopleCount++;
                getPerson(people[iNo], function () {});
            }
        }
    } else {
        $(window).trigger('contactsSavingReset', [e]);
    }
}

function _renderPerson(iNo) {
    var person = people[iNo];
    if (person.name) {
        person.index_num = 'in' + iNo;

        var $person = $(personTemplate);
        $person.attr('id', 'person_' + person.index_num);

        var $checkbox = $person.find('[type="checkbox"]');
        $checkbox.val(person.index_num);

        $name = $person.find('.js-contact-name');
        $name.text(truncText(person.name, 23));

        var $image = $person.find('.js-contact-avatar > img');
        if (person.logo) {
            $image.attr('src', person.logo);
        } else {
            $image.attr('src', '../img/ghost_person.png');
        }
        $('#peopleList').append($person);
    }
}

function renderPeopleList(people) {
    if (people) {
        for (var iNo = 0; iNo < people.length; iNo++) {
            if (people[iNo]) {
                _renderPerson(iNo);
            }
        }

        var $select = $('#userPeopleSelect');

        $select.on('change', function () {
            maDefaultPeopleListId = $select.val();
            localStorage[LS_LastPeopleListId] = maDefaultPeopleListId;
        });

        $(window).on('userListsLoaded', function (event, type, data) {
            if (type === 'people') {
                showAvailableLists(data, 'userPeopleSelect', maDefaultPeopleListId);
                maDefaultPeopleListId = $select.val();
                localStorage[LS_LastPeopleListId] = maDefaultPeopleListId;
                checkPrevAddedPeople(people, data);
            }

        });
        getMAList('people', true);

        $('#sendPeople').on('click', sendPeopleDef);

        $countPeople.text(people.length);

        if (people.length > 2) {
            _addSelectAll('#peopleList');
        }
    } else {
        $countPeople.text('');
    }

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

function listItemsEventHandlers() {
    $peopleList.on('change', '.js-list-item input', function () {
        _countSelected($peopleList, $countSelectedPeople);
    });
}

function checkPrevAddedPeople(people, userLists) {
    var list = {};
    $.each(people, function (iNo, person) {
        var ids = ['', ''];
        if (person.source_id) {
            ids[0] = person.source_id;
        }
        if (person.source_id_2) {
            ids[1] = person.source_id_2;
        }
        list[person.index_num] = ids;
    });

    $.post(getMainHost() + '/api/getListsByPeoplesIds', list, function (response) {
        if ((response.result) && (response.list)) {
            for (var resp in response.list) {
                if (response.list[resp]['disabled']) {
                    $('#person_' + resp).addClass('unsavable').prop('title', "This profile can not be saved due to owner's request").find('input').prop('checked', false).prop('disabled', true);
                } else {
                    toggleStatusClass('#person_' + resp, 'saved');
                    $('#person_' + resp).addClass('saved__already').find('input').prop('checked', false);

                    var savedListName = getListNameById(userLists, response.list[resp]);
                    $('#person_' + resp).addClass('saved__already').find('input').prop('checked', false);
                    $('#person_' + resp).find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);
                }
            }
        }
    });

}

function _countSelected($list, $counter) {
    var selected = $list.find('.js-list-item input:checked').length;
    var all = $list.find('.js-list-item input').length;
    if (selected !== all) {
        $counter.text('(' + selected + ' selected)');
    } else {
        $counter.empty();
    }
}

if (chrome.tabs) {

    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

        localizeHtml();

        maDefaultPeopleListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;

        chrome.tabs.sendMessage(tab.id, {
            method: 'getInnerHTML'
        }, function (response) {
            if (response) {

                people = getUserListFromSearch(response.data);
                if (people && (people.length > 0)) {
                    renderPeopleList(people);
                    $('#peopleTabLink').tab('show');
                } else {
                    $('#peopleTabLink').hide();
                }

                $('#autoSearch').attr('href', 'LinkedInAutoSearch_R.html');
                $('#autoSearch').removeClass('hidden');

                listItemsEventHandlers();

                if (!people || people.length == 0) {
                    $('#notFoundTemplate').removeClass('hide');
                    $('.btn.btn-primary').addClass('disabled');
                } else {
                }
            } else {
                $(document.body).append('<div class="main-body contacts-table"><div class="alert alert-warning">Please try refreshing the page in your browser</div></div>');
                $('#peopleList').addClass('hidden');
                $('.main-footer').addClass('hidden');
            }
        });
    });

}

function localizeHtml() {
}

document.addEventListener('DOMContentLoaded', function () {
});