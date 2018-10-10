var liAccount;

var isDefInt = false;
var isRecruterInt = false;
var isSalesNavInt = false;
var isGoogleSeacrh = false;
var isGroup = false;
var companyIdList = {};

var companies = [];
var people = [];
var maListJsonCompany = {};
var maListJsonPeople = {};
var maDefaultCompanyListId = 0;
var maDefaultPeopleListId = 0;
var index_num = 0;

var personTemplate = $('#personTemplate').html();
var companyTemplate = $('#companyTemplate').html();

$body = $('body');
$peopleList = $('#peopleList');
$companiesList = $('#companiesList');
$countPeople = $('#countPeople');
$countSelectedPeople = $('#countSelectedPeople');
var $countCompanies = $('#countCompanies');
var $countSelectedCompanies = $('#countSelectedCompanies');
var $select;


var peopleList = [];

var waitingPeopleCount = 0;
var processedPeopleCount = 0;
var queueIsEmpty = false;

var currentCompanies = [];
var currentCompIds = [];
var waitingCompaniesCount = 0;
var processedCompaniesCount = 0;
var e_e;
var pageHTML;
var currentUrl;

var cmpnsIds = [];
var pplIds = new peoplesCache();
var recentlyUpdatedPeoples = {
    ids_2: [],
    ids: []
};

function sendPeople_Search() {

    if ($select.hasClass('hidden')) {
        var newUserList = $('#userPeopleInput').val();
    }

    if (newUserList) {
        var params = 'listName=' + newUserList + '&list=' + encodeURIComponent(convertHtmlToText(JSON.stringify(peopleList)));
        void 0;
    } else {
        var params = 'listId=' + maDefaultPeopleListId + '&list=' + encodeURIComponent(convertHtmlToText(JSON.stringify(peopleList)));
        void 0;
    }

    void 0;
    $.post(getMainHost() + '/api/createPeople', params, function (response) {
        localStorage['needUpdateMA'] = 1;

        void 0;

        if (response.result) {
            if (currentCompanies && (currentCompanies.length > 0)) {
                for (var iNo = 0; iNo < currentCompanies.length; iNo++) {
                    cmpnsIds.push(currentCompanies[iNo].source_id);
                }
                localStorage['cmpnsIds'] = cmpnsIds.join(',');
                currentCompanies = [];
            }
            for (var iNo = 0; iNo < peopleList.length; iNo++) {
                if (peopleList[iNo].source_id) {
                    pplIds.addSourceIdToCache(peopleList[iNo].source_id);
                }
                if (peopleList[iNo].source_id_2) {
                    pplIds.addSourceIdToCache_2(peopleList[iNo].source_id_2);
                }
            }
            pplIds.saveToStorage();

            if (newUserList) {
                $(window).on('userListsLoaded', function (event, type, data, update) {
                    void 0;
                    var listJson = JSON.parse(data);
                    if (listJson && listJson.result && listJson.list) {
                        for (var iNo = 0; iNo < listJson.list.length; iNo++) {
                            if (newUserList == listJson.list[iNo].name) {
                                maDefaultPeopleListId = listJson.list[iNo].id;
                                localStorage[LS_LastPeopleListId] = maDefaultPeopleListId;
                                showAvailableLists(data, 'userPeopleSelect', maDefaultPeopleListId, update);
                                break;
                            }
                        }
                    }
                    $('#warning2').addClass(' hidden');
                    $(window).trigger('contactsSaved', [e_e]);
                });
                getMAList('people', true);
            } else {
                $('#warning2').addClass(' hidden');
                $(window).trigger('contactsSaved', [e_e]);
            }

        } else {
            void 0;
            if ((response.result == 0) && (response.code) && (response.message)) {
                $('#warning2').addClass(' hidden');
                document.getElementById('errorMessage').innerText = response.message;
                show(document.getElementById('errorMessage'));
                $(window).trigger('contactsSaved', [e_e]);

                if (response.code == 8) {
                    document.getElementById('errorMessage').innerHTML = response.message.replace('link', '<a href="' + getMainHost() + '/pricing-plans" target="_blank">link</a>');
                }
            }
        }
    });
}

function sendCompany_Search() {
    var params = 'noAuth=true&list=' + encodeURIComponent(JSON.stringify(currentCompanies));
    void 0;


    for (var iComp = 0; iComp < currentCompanies.length; iComp++) {
        var bBreak = false;

        var company = currentCompanies[iComp];
        for (var iPeop = 0; iPeop < peopleList.length; iPeop++) {
            if (peopleList[iPeop].current && (peopleList[iPeop].current.length > 0)) {
                for (var iCur = 0; iCur < peopleList[iPeop].current.length; iCur++) {
                    if (peopleList[iPeop].current[iCur].source_id && (peopleList[iPeop].current[iCur].source_id == company.source_id)) {
                        if (!peopleList[iPeop].companies) {
                            peopleList[iPeop].companies = [];
                        }
                        peopleList[iPeop].companies.push(company);
                        bBreak = true;
                        break;
                    }
                }
                if (bBreak) {
                    break;
                }
            }
            if (peopleList[iPeop].previous && (peopleList[iPeop].previous.length > 0)) {
                for (var iPrev = 0; iPrev < peopleList[iPeop].previous.length; iPrev++) {
                    if (peopleList[iPeop].previous[iPrev].source_id && (peopleList[iPeop].previous[iPrev].source_id == company.source_id)) {
                        if (!peopleList[iPeop].companies) {
                            peopleList[iPeop].companies = [];
                        }
                        peopleList[iPeop].companies.push(company);
                        bBreak = true;
                        break;
                    }
                }
                if (bBreak) {
                    break;
                }
            }
        }
    }

    sendPeople_Search();
}

function checkCurrentCompaniesForSend() {
    void 0;

    if ((processedPeopleCount > 0) && queueIsEmpty && (processedPeopleCount == waitingPeopleCount) && (processedCompaniesCount == waitingCompaniesCount)) {
        waitingCompaniesCount = 0;
        processedCompaniesCount = 0;
        queueIsEmpty = false;

        sendCompany_Search(sendPeople_Search);
    }
}

function getPerson(person, cb) {

    function processWorks(workArray) {
        for (key in workArray) {
            if ((workArray[key].source_id) && (currentCompIds.indexOf(workArray[key].source_id) < 0) && (cmpnsIds.indexOf(workArray[key].source_id.toString()) < 0)) {
                currentCompIds.push(workArray[key].source_id);
                if (isRecruterInt) {
                    var cUrl = 'https://www.linkedin.com/recruiter/company/' + workArray[key].source_id;
                } else {
                    if (isSalesNavInt) {
                        if (profileLink.indexOf('https://www.linkedin.com/sales-api/salesApiProfiles/') == 0) {
                            var cUrl = 'https://www.linkedin.com/sales-api/salesApiCompanies/' + workArray[key].source_id;
                            cUrl += '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';
                        } else {
                            var cUrl = 'https://www.linkedin.com/sales/accounts/insights?companyId=' + workArray[key].source_id;
                        }
                    } else {
                        var cUrl = 'https://www.linkedin.com/company/' + workArray[key].source_id + '/';
                    }
                }

                waitingCompaniesCount++;
                var jqxhr = $.get(cUrl, '', function (response) {
                    if (isRecruterInt) {
                        var company = getCompanyInfo_C_R(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                    } else {
                        if (isSalesNavInt) {
                            if (profileLink.indexOf('https://www.linkedin.com/sales-api/salesApiProfiles/') == 0) {
                                var company = getCompanyInfo_C_S(response);
                            } else {
                                var company = getCompanyInfo_C_S(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                            }
                        } else {
                            var company = getCompanyInfo(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                        }
                    }
                    if (company && company.name && company.source_id) {
                        currentCompanies.push(company);
                    }
                    processedCompaniesCount++;
                    checkCurrentCompaniesForSend();
                });

                jqxhr.fail(function () {
                    void 0;
                    processedCompaniesCount++;
                    checkCurrentCompaniesForSend();
                });
            }
        }
    }

    if (person.source_id_2 || person.searchLink) {
        var profileLink = '';
        if (isRecruterInt) {
            profileLink = 'https://www.linkedin.com' + person.searchLink;
        } else {
            if (isSalesNavInt) {
                if ((person.searchLink.indexOf('www.linkedin') == -1)) {
                    profileLink = 'https://www.linkedin.com' + person.searchLink;

                    if (localStorage['csrfToken']) {

                        var fnd = person.searchLink.match(/\/profile\/(.+?),(.+?),(.+?)(\?|$)/i);
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
                                profileLink = 'https://www.linkedin.com/sales-api/salesApiProfiles/(';
                                profileLink += 'profileId:' + profileId + ',authType:NAME_SEARCH,authToken:' + authToken + ')';
                                profileLink += '?decoration=%28entityUrn%2CobjectUrn%2CpictureInfo%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cheadline%2CmemberBadges%2Cdegree%2CprofileUnlockInfo%2Clocation%2Cindustry%2CnumOfConnections%2CinmailRestriction%2CsavedLead%2CdefaultPosition%2CcontactInfo%2Csummary%2CcrmStatus%2CpendingInvitation%2Cunlocked%2CrelatedColleagueCompanyId%2CnumOfSharedConnections%2CshowTotalConnectionsPage%2CconnectedTime%2CnoteCount%2CmailboxThreadUrn%2CmessageSentCount%2CflagshipProfileUrl%2Cpositions*%2Ceducations*%2Ctags*~fs_salesTag%28entityUrn%2Ctype%2Cvalue%29%29';
                            }
                        }
                    }
                } else {
                    profileLink = person.searchLink;

                    if (localStorage['csrfToken']) {

                        var fnd = person.searchLink.match(/sales\/people\/(.+?),(.+?),(.+?)(\?|$)/i);
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
                                profileLink = 'https://www.linkedin.com/sales-api/salesApiProfiles/(';
                                profileLink += 'profileId:' + profileId + ',authType:NAME_SEARCH,authToken:' + authToken + ')';
                                profileLink += '?decoration=%28entityUrn%2CobjectUrn%2CpictureInfo%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cheadline%2CmemberBadges%2Cdegree%2CprofileUnlockInfo%2Clocation%2Cindustry%2CnumOfConnections%2CinmailRestriction%2CsavedLead%2CdefaultPosition%2CcontactInfo%2Csummary%2CcrmStatus%2CpendingInvitation%2Cunlocked%2CrelatedColleagueCompanyId%2CnumOfSharedConnections%2CshowTotalConnectionsPage%2CconnectedTime%2CnoteCount%2CmailboxThreadUrn%2CmessageSentCount%2CflagshipProfileUrl%2Cpositions*%2Ceducations*%2Ctags*~fs_salesTag%28entityUrn%2Ctype%2Cvalue%29%29';
                            }
                        }
                    }
                }
            } else {
                if (person.searchLink) {
                    profileLink = 'https://www.linkedin.com' + person.searchLink + '/';
                } else {
                    if (person.source_id_2) {
                        profileLink = 'https://www.linkedin.com/in/' + person.source_id_2 + '/';
                    }
                }

            }
        }

        var jqxhr = $.get(profileLink, '', function (response) {
            if (response) {

                liAccounts.incLiCounter(liAccount, 1);

                if (isRecruterInt) {
                    person2 = getUserInfo_P_R(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                } else {
                    if (isSalesNavInt) {
                        if (profileLink.indexOf('https://www.linkedin.com/sales-api/salesApiProfiles/') == 0) {
                            person2 = getUserInfo_P_S2(response);
                        } else {
                            person2 = getUserInfo_P_S(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                            if (!person2) {
                                person2 = getUserInfo_P_S2(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                            }
                        }
                    } else {
                        void 0;
                        var person2 = getUserInfo(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'), person.name);
                    }
                }

                if (person2 && person2.name) {

                    if (person2.name !== person.name) {
                        void 0;
                        void 0;
                        void 0;
                    }

                    if (person2.current && (person2.current.length > 0)) {
                        var works = person2.current;
                        processWorks(works);
                    }
                    if (person2.previous && (person2.previous.length > 0)) {
                        var works = person2.previous;
                        processWorks(works);
                    }

                    peopleList.push(person2);
                    setTimeout(toggleStatusClass, 2000, '#person_' + person.index_num, 'saved');
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
        jqxhr.fail(function () {
            toggleStatusClass('#person_' + person.index_num, 'error');
            cb();
            void 0;
            processedPeopleCount++;
            checkCurrentCompaniesForSend();
        });
    }
}

function parseResponsePerson_S(response, person) {
    try {
        if (response && response.result) {
            localStorage['needUpdateMA'] = 1;
            toggleStatusClass('#person_' + person.index_num, 'saved');
        } else {
            toggleStatusClass('#person_' + person.index_num, 'error');
        }
    } catch (err) {
        toggleStatusClass('#person_' + person.index_num, 'error');
    }
}

function sendPerson(person, cb) {
    toggleStatusClass('#person_' + person.index_num, 'processing');

    var params = 'listId=' + maDefaultPeopleListId + '&list=[' + encodeURIComponent(JSON.stringify(person)) + ']';
    $.post(getMainHost() + '/api/createPeople', params, function (response) {
        void 0;
        parseResponsePerson_S(response, person);

        cb();
    });
}

function sendPeopleGoogle(e) {
    e.preventDefault();
    $(window).trigger('contactsSaving', [e]);

    var selectedLength = $peopleList.find('.js-list-item input:checked').length;

    if (people) {
        var i = 0;
        for (var iNo = 0; iNo < people.length; iNo++) {
            selected = $('#person_' + people[iNo].index_num).find('input')[0].checked;
            if (selected) {
                sendPerson(people[iNo], function () {
                    if (i == selectedLength - 1) {
                        $(window).trigger('contactsSaved', [e])
                    }
                    i++;
                });
            }
        }
    } else {
        $(window).trigger('contactsSavingReset', [e]);
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

        if (localStorage['cmpnsIds']) {
            cmpnsIds = localStorage['cmpnsIds'].split(',');
        }

        for (var iNo = 0; iNo < people.length; iNo++) {
            selected = $('#person_' + people[iNo].index_num).find('input')[0].checked;
            if (selected) {
                var prsn = people[iNo];
                toggleStatusClass('#person_' + people[iNo].index_num, 'processing');

                waitingPeopleCount++;

                if (((prsn.source_id_2) && pplIds.checkSourceIdInCache_2(prsn.source_id_2)) || ((prsn.source_id) && pplIds.checkSourceIdInCache(prsn.source_id))) {
                    prsn.source = 'linkedIn';

                    toggleStatusClass('#person_' + people[iNo].index_num, 'saved');

                    if (prsn.current) {
                        delete prsn.current;
                    }
                    if (prsn.previous) {
                        delete prsn.previous;
                    }
                    if (prsn.description) {
                        delete prsn.description;
                    }
                    if (prsn.index_num) {
                        delete prsn.index_num;
                    }
                    if (prsn.locality) {
                        delete prsn.locality;
                    }
                    if (prsn.searchLink) {
                        delete prsn.searchLink;
                    }

                    peopleList.push(prsn);
                    processedPeopleCount++;
                    checkCurrentCompaniesForSend();
                } else {
                    if (((prsn.source_id_2 && (recentlyUpdatedPeoples.ids_2.indexOf(prsn.source_id_2.toString()) > -1)) || (prsn.source_id && recentlyUpdatedPeoples.ids.indexOf(prsn.source_id.toString()) > -1))) {

                        toggleStatusClass('#person_' + people[iNo].index_num, 'saved');

                        prsn.source = 'linkedIn';
                        if (prsn.current) {
                            delete prsn.current;
                        }
                        if (prsn.previous) {
                            delete prsn.previous;
                        }
                        if (prsn.description) {
                            delete prsn.description;
                        }
                        if (prsn.index_num) {
                            delete prsn.index_num;
                        }
                        if (prsn.locality) {
                            delete prsn.locality;
                        }
                        if (prsn.searchLink) {
                            delete prsn.searchLink;
                        }

                        peopleList.push(prsn);

                        processedPeopleCount++;
                        checkCurrentCompaniesForSend();
                    } else {
                        getPerson(prsn, function () {});
                    }
                }
            }
        }
        queueIsEmpty = true;
        checkCurrentCompaniesForSend();
    } else {
        $(window).trigger('contactsSavingReset', [e]);
    }
}

function sendCompanyBlock(companies) {
    params = 'listId=' + maDefaultCompanyListId + '&list=' + encodeURIComponent(JSON.stringify(companies));

    var jqxhr = $.post(getMainHost() + '/api/createCompany', params, function (response) {
        void 0;

        if (response && response.result) {
            localStorage['needUpdateMA'] = 1;
            $(window).trigger('contactsSaved', [e_e]);
        } else {
            $(window).trigger('contactsSavingReset', [e_e]);
        }
    });
}

function checkCompaniesForSend() {
    void 0;

    if (processedCompaniesCount == waitingCompaniesCount) {
        waitingCompaniesCount = 0;
        processedCompaniesCount = 0;

        sendCompanyBlock(currentCompanies);
    }
}

function grabCompanyProfile(source_id) {
    toggleStatusClass('#company_' + source_id, 'processing');

    if (isSalesNavInt) {
        if (localStorage['csrfToken']) {
            var cUrl = 'https://www.linkedin.com/sales-api/salesApiCompanies/' + source_id;
            cUrl += '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';
        } else {
            var cUrl = 'https://www.linkedin.com/sales/accounts/insights?companyId=' + source_id;
        }
    } else {
        var cUrl = 'https://www.linkedin.com/company/' + source_id + '/';
    }
    waitingCompaniesCount++;
    var jqxhr = $.get(cUrl, '', function (response) {
        if (localStorage['csrfToken']) {
            var resp = response;
        } else {
            var resp = response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
        }

        if (isSalesNavInt) {
            var company = getCompanyInfo_C_S(resp);
        } else {
            var company = getCompanyInfo(resp);
        }

        if (company && company.name && company.source_id) {
            void 0;
            void 0;

            currentCompanies.push(company);

            toggleStatusClass('#company_' + source_id, 'saved');
        } else {
            toggleStatusClass('#company_' + source_id, 'error');
        }
        processedCompaniesCount++;
        checkCompaniesForSend();
    });

    jqxhr.fail(function () {
        void 0;
        toggleStatusClass('#company_' + source_id, 'error');
        processedCompaniesCount++;
        checkCompaniesForSend();
    });
}

function sendCompanies(e) {
    e.preventDefault();
    $(window).trigger('contactsSaving', [e]);
    e_e = e;
    void 0;

    var selectedLength = $companiesList.find('.js-list-item input:checked').length;

    if (companies && (selectedLength > 0)) {
        for (var iNo = 0; iNo < companies.length; iNo++) {
            selected = $('#company_' + companies[iNo].source_id).find('input')[0].checked;
            if (selected && companies[iNo].source_id) {
                grabCompanyProfile(companies[iNo].source_id);
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

function renderPeopleList(people) {

    liAccount = liAccounts.detectAccountAndCheckLimits(pageHTML, isDefInt, isSalesNavInt, isRecruterInt);

    if (people) {
        for (var iNo = 0; iNo < people.length; iNo++) {
            if (people[iNo]) {
                _renderPerson(iNo);
            }
        }

        $select = $('#userPeopleSelect');

        $select.on('change', function () {
            maDefaultPeopleListId = $select.val();
            localStorage[LS_LastPeopleListId] = maDefaultPeopleListId;
        });

        if (chrome.tabs) {

            $select.on('dblclick', showUserPeopleInput);
            $('#addUserList').on('click', showUserPeopleInput);

            $(window).on('userListsLoaded', function (event, type, data, update) {
                if (type === 'people') {
                    showAvailableLists(data, 'userPeopleSelect', maDefaultPeopleListId, update);
                    maDefaultPeopleListId = $select.val();
                    localStorage[LS_LastPeopleListId] = maDefaultPeopleListId;

                    if (!update) {
                        if (isDefInt && !isRecruterInt && !isSalesNavInt) {
                            if (people && (people.length > 0) && people[0].source_id_2) {
                                checkPrevAddedPeople(people, data);
                            } else {
                                getIdentifiers(pageHTML, checkPrevAddedPeople, people, data, currentUrl);
                            }
                        } else {
                            checkPrevAddedPeople(people, data);
                        }

                        $('#refreshPeopleSelect').removeClass('hidden');
                        $('#addUserList').removeClass('hidden');
                        $('#refreshPeopleSelect').on('click', function () {
                            $('#refreshPeopleSelect').addClass('icon-refresh-animate');
                            getMAList('people', true);
                        });
                    }

                    $('#refreshPeopleSelect').removeClass('icon-refresh-animate');
                }
            });
            getMAList('people');
        } else {
            showAvailableLists(maListJsonPeople, 'userPeopleSelect', maDefaultPeopleListId);
        }

        if (isGoogleSeacrh) {
            $('#sendPeople').on('click', sendPeopleGoogle);
        } else {
            $('#sendPeople').on('click', sendPeopleDef);
        }

        $countPeople.text(people.length);

        if (people.length > 2) {
            _addSelectAll('#peopleList');
        }
    } else {
        $countPeople.text('');
    }

}

function _renderCompany(iNo) {
    var company = companies[iNo];
    if (company.name) {

        var $company = $(companyTemplate);
        $company.attr('id', 'company_' + company.source_id)

        var $checkbox = $company.find('[type="checkbox"]');
        $checkbox.val(company.source_id);

        $name = $company.find('.js-contact-name');
        $name.text(truncText(company.name, 23));

        var $image = $company.find('.js-contact-avatar > img');
        if (company.logo) {
            $image.attr('src', company.logo);
        } else {
            $image.attr('src', '../img/ghost_company.png');
        }
        $('#companiesList').append($company);
    }
}

function renderCompaniesList(companies) {

    if (companies) {
        for (var iNo = 0; iNo < companies.length; iNo++) {
            if (companies[iNo]) {
                _renderCompany(iNo);
            }
        }

        var $select = $('#userCompaniesSelect');

        $select.on('change', function () {
            maDefaultCompanyListId = $select.val();
            localStorage[LS_LastCompanyListId] = maDefaultCompanyListId;
        });

        if (chrome.tabs) {
            $(window).on('userListsLoaded', function (event, type, data) {
                if (type === 'company') {
                    showAvailableLists(data, 'userCompaniesSelect', maDefaultCompanyListId);
                    maDefaultCompanyListId = $select.val();
                    localStorage[LS_LastCompanyListId] = maDefaultCompanyListId;
                    checkPrevAddedCompanies(companies, data);
                }
            });
            getMAList('company', true);

        } else {
            showAvailableLists(maListJsonCompany, 'userCompaniesSelect', maDefaultCompanyListId);
        }

        $('#sendCompanies').on('click', sendCompanies);

        $countCompanies.text(companies.length);

        if (companies.length > 0) {
            _addSelectAll('#companiesList');
        }
    } else {
        $countCompanies.empty();
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
    $companiesList.on('change', '.js-list-item input', function () {
        _countSelected($companiesList, $countSelectedCompanies);
    });
}

function checkPrevAddedCompanies(companies, userLists) {
    var obj = {};
    obj['list'] = [];
    $.each(companies, function (iNo, company) {
        obj['list'].push(company.source_id);
    });

    $.post(getMainHost() + '/api/getListsByCompaniesIds', obj, function (response) {
        if ((response.result) && (response.list)) {
            for (var resp in response.list) {
                toggleStatusClass('#company_' + resp, 'saved');
                var savedListName = getListNameById(userLists, response.list[resp]);
                $('#company_' + resp).addClass('saved__already').find('input').prop('checked', false);
                $('#company_' + resp).find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);
            }
        }
    });
}

function checkRecentlyUpdatedPeoples(people) {
    var list = {
        ids_2: [],
        ids: []
    };
    for (var iNo = 0; iNo < people.length; iNo++) {
        if (people[iNo].source_id) {
            list.ids.push(people[iNo].source_id);
        }
        if (people[iNo].source_id_2) {
            list.ids_2.push(people[iNo].source_id_2);
        }
    }

    $.post(getMainHost() + '/api/getRecentlyUpdatedPeoples', list, function (response) {
        if ((response.result) && (response.list)) {
            recentlyUpdatedPeoples = response.list;
        }
    });
}

function checkPrevAddedPeople(people, userLists) {
    checkRecentlyUpdatedPeoples(people);

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

    void 0;

    $.post(getMainHost() + '/api/getListsByPeoplesIds', list, function (response) {
        if ((response.result) && (response.list)) {
            for (var resp in response.list) {
                if (response.list[resp]['disabled']) {
                    $('#person_' + resp).addClass('unsavable').prop('title', "This profile can not be saved due to owner's request").find('input').prop('checked', false).prop('disabled', true);
                } else {
                    toggleStatusClass('#person_' + resp, 'saved');
                    $('#person_' + resp).addClass('saved__already').find('input').prop('checked', false);

                    var savedListName = getListNameById(userLists, response.list[resp]);
                    $('#person_' + resp).find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);
                }
            }
        }
        $('.btn.btn-primary').attr('disabled', false);
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

function sendPeopleByNewTask(e) {
    if (people && ($peopleList.find('.js-list-item input:checked').length > 0)) {
        for (var iNo = 0; iNo < people.length; iNo++) {
            if ($('#person_' + people[iNo].index_num).find('input')[0].checked) {
                peopleList.push(people[iNo]);
            }
        }

        localStorage['people'] = JSON.stringify(peopleList);
        peopleList = undefined;

        if ($select.hasClass('hidden')) {
            localStorage['userListname'] = $('#userPeopleInput').val();
            localStorage[LS_LastPeopleListId] = '';
        } else {
            localStorage['userListname'] = $('#userPeopleSelect option:selected').text();
        }

        localStorage['liAccount'] = JSON.stringify(liAccount);

        window.location.href = '../html/LinkedInAutoSearchNew.html';
    } else {
        $(window).trigger('contactsSavingReset', [e]);
    }
}

if (chrome.tabs) {

    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

                        localizeHtml();

        maDefaultPeopleListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;
        maDefaultCompanyListId = (localStorage[LS_LastCompanyListId]) ? localStorage[LS_LastCompanyListId] : 0;

        chrome.tabs.sendMessage(tab.id, {
            method: 'getInnerHTML'
        }, function (response) {
            currentUrl = tab.url;

            if (response) {

                pageHTML = response.data;

                if (tab.url.indexOf('/recruiter/') !== -1) {
                    isRecruterInt = true;

                    people = getPeople_S_R(response.data);
                    if (people && (people.length > 0)) {
                        renderPeopleList(people);
                        $('#peopleTabLink').tab('show');
                    } else {
                        $('#peopleTabLink').hide();
                    }

                    $('#autoSearch').attr('href', 'LinkedInAutoSearch_R.html');
                    $('#autoSearch').removeClass('hidden');
                } else {
                    if (tab.url.indexOf('/sales/') !== -1) {
                        isSalesNavInt = true;

                        if (localStorage['csrfToken']) {
                            $.ajaxSetup({
                                headers: {
                                    'csrf-token': localStorage['csrfToken'],
                                    'x-restli-protocol-version': '2.0.0'
                                },
                                global: false,
                                type: 'GET'
                            })
                        }

                        if (tab.url.indexOf('/sales/search/people') !== -1) {

                            $.get(tab.url, (response) => {
                                people = getPeople_S_SP(response);
                                if (people && (people.length > 0)) {
                                    renderPeopleList(people);
                                    $('#peopleTabLink').tab('show');

                                    $('#sendPeople').unbind('click').click(sendPeopleByNewTask);
                                    $('#autoSearch').attr('href', 'backgroundTasks.html').text('Search Task List');
                                    $('#autoSearch').removeClass('hidden');
                                } else {
                                    $('#notFoundTemplate').removeClass('hide');
                                    $('.btn.btn-primary').addClass('disabled');
                                }
                            })
                        } else {
                            people = getPeople_S_S(response.data);
                            if (people && (people.length > 0)) {
                                renderPeopleList(people);
                                $('#peopleTabLink').tab('show');

                                $('#sendPeople').unbind('click').click(sendPeopleByNewTask);
                                $('#autoSearch').attr('href', 'backgroundTasks.html').text('Search Task List');
                                $('#autoSearch').removeClass('hidden');
                            } else {
                                $('#peopleTabLink').hide();
                            }

                            companies = getCompanies_S_S(response.data);
                            if ((companies && (companies.length > 0)) && !(people && (people.length > 0))) {
                                renderCompaniesList(companies);
                                $('#companiesTabLink').tab('show');

                                $('#autoSearch2').attr('href', 'LinkedInAutoSearch_S.html');
                                $('#autoSearch2').removeClass('hidden');
                            } else {
                                if (tab.url.indexOf('sales/search/company') !== -1) {
                                    $.get(tab.url, (response) => {
                                        companies = getCompanies_S_SP(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                                        if ((companies && (companies.length > 0)) && !(people && (people.length > 0))) {
                                            renderCompaniesList(companies);
                                            $('#companiesTabLink').tab('show');
                                        } else {
                                            $('#companiesTabLink').hide();
                                        }
                                    })
                                } else {
                                    $('#companiesTabLink').hide();
                                }
                            }
                        }
                    } else {
                        isDefInt = true;

                        if (tab.url.indexOf('/groups/') !== -1) {
                            isGroup = true;
                        } else {
                            if ((tab.url.indexOf('google') !== -1) && (tab.url.indexOf('search') !== -1)) {
                                isGoogleSeacrh = true;
                                isDefInt = false;
                            } else {
                                $('#sendPeople').unbind('click').click(sendPeopleByNewTask);
                                $('#autoSearch').attr('href', 'backgroundTasks.html').text('Search Task List');
                                $('#autoSearch').removeClass('hidden');
                            }
                        }


                        companies = getCompanies(response.data);
                        if ((companies && (companies.length > 0)) && !(people && (people.length > 0))) {
                            renderCompaniesList(companies);
                            $('#companiesTabLink').tab('show');
                        } else {
                            $('#companiesTabLink').hide();
                        }

                        people = getPeople(response.data.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'), isGoogleSeacrh);
                        if (people && (people.length > 0)) {
                            renderPeopleList(people);
                            $('#peopleTabLink').tab('show');
                        } else {
                            if (isGoogleSeacrh) {
                                window.location.href = "../html/GoogleSearch.html";
                            }
                        }
                    }
                }

                listItemsEventHandlers();

                if ((!people || people.length == 0) && (!companies || companies.length == 0)) {
                    if ((tab.url.indexOf('/sales/search/people') == -1) && (tab.url.indexOf('sales/search/company') == -1)) {
                        $('#notFoundTemplate').removeClass('hide');
                        $('.btn.btn-primary').addClass('disabled');
                    }
                } else {
                }
            } else {
                $(document.body).append('<div class="main-body contacts-table"><div class="alert alert-warning">Please try refreshing the page in your browser</div></div>');
                $('#peopleList').addClass('hidden');
                $('.main-footer').addClass('hidden');
            }
        });
    });

} else if (!people.length && $.isEmptyObject(maListJsonPeople)) {

    document.addEventListener('DOMContentLoaded', function () {
        renderPeopleList(people);
        renderCompaniesList(companies);

        listItemsEventHandlers();
    });
}



function localizeHtml() {
}

document.addEventListener('DOMContentLoaded', function () {
});