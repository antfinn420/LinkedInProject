var liAccount;

var searchUrl = '';
var pageNoStart = 1;
var pageNoFinish = 5;
var iCurPageNo = 1;
var sleepValueMin = 250;
var sleepValueMax = 350;

var maDefaultListId = 0;
var $userPeopleSelect = $('#userPeopleSelect');
var $userCompaniesSelect = $('#userCompaniesSelect');

var waitingPeopleCount = 0;
var processedPeopleCount = 0;
var queueIsEmpty = false;
var currentPeopleList = [];
var allSendPeoplesCount = 0;

var currentCompanies = [];
var currentCompIds = [];
var waitingCompaniesCount = 0;
var processedCompaniesCount = 0;

var peopleCountOnPage = 25;

var peopleSearch = true;

var e_e;
var cmpnsIds = [];
var pplIds = new peoplesCache();
var recentlyUpdatedPeoples = {
    ids_2: [],
    ids: []
};
var recentlyUpdatedCompanies = {
    ids: []
};

var trackingInfo;

function changeProgresStatus() {
    $progress = $('#progressStatus');

    var percentsUsed = 0.00;
    if (iCurPageNo > 1) {
        percentsUsed = ((100 / (pageNoFinish - pageNoStart + 1)) * (iCurPageNo - pageNoStart));
    }

    percentsUsed = (percentsUsed + ((100 / (pageNoFinish - pageNoStart + 1) / (people.length + 2)) * processedPeopleCount));

    percentsUsed = percentsUsed.toFixed(2);

    $progress.css('width', percentsUsed + '%');
    $progress.text(percentsUsed + '% (' + allSendPeoplesCount + '/' + (iCurPageNo - pageNoStart) + ' pages)');
}

function changeProgresStatus_2() {
    $progress = $('#progressStatus');

    var percentsUsed = 0.00;
    if (iCurPageNo > 1) {
        percentsUsed = ((100 / (pageNoFinish - pageNoStart + 1)) * (iCurPageNo - pageNoStart));
    }

    percentsUsed = (percentsUsed + ((100 / (pageNoFinish - pageNoStart + 1) / (companies.length + 2)) * processedCompaniesCount));

    percentsUsed = percentsUsed.toFixed(2);

    $progress.css('width', percentsUsed + '%');
    $progress.text(percentsUsed + '% (' + allSendPeoplesCount + '/' + (iCurPageNo - pageNoStart) + ' pages)');
}

function sendPeople_CA() {
    var params = 'listId=' + maDefaultListId + '&list=' + encodeURIComponent(convertHtmlToText(JSON.stringify(currentPeopleList)));
    void 0;
    $.post(getMainHost() + '/api/createPeople', params, function (response) {
        localStorage['needUpdateMA'] = 1;

        void 0;

        waitingPeopleCount = 0;
        processedPeopleCount = 0;
        allSendPeoplesCount = allSendPeoplesCount + currentPeopleList.length;

        iCurPageNo++;
        changeProgresStatus();

        if (response.result) {
            if (currentCompanies && (currentCompanies.length > 0)) {
                for (var iNo = 0; iNo < currentCompanies.length; iNo++) {
                    cmpnsIds.push(currentCompanies[iNo].source_id);
                }
                localStorage['cmpnsIds'] = cmpnsIds.join(',');
                currentCompanies = [];
            }
            for (var iNo = 0; iNo < currentPeopleList.length; iNo++) {
                pplIds.addSourceIdToCache(currentPeopleList[iNo].source_id);
            }
            pplIds.saveToStorage();

            liAccounts.checkLimits(liAccount);
            setTimeout(getNextSearchPage, randomInteger(3000, 4000));
        } else {
            $('#progressStatus').addClass(' progress-bar-danger');
            $('#progressStatus').removeClass('active');
            void 0;
            $('#warning2').addClass(' hidden');
            $(window).trigger('contactsSaved', [e_e]);
        }
        currentPeopleList = [];
    });
}

function sendCompany_CA_2() {
    var params = 'listId=' + maDefaultListId + '&list=' + encodeURIComponent(convertHtmlToText(JSON.stringify(currentCompanies)));
    void 0;

    $.post(getMainHost() + '/api/createCompany', params, function (response) {
        localStorage['needUpdateMA'] = 1;

        void 0;

        allSendPeoplesCount = allSendPeoplesCount + currentCompanies.length;

        iCurPageNo++;
        changeProgresStatus_2();

        if (response.result) {
            setTimeout(getNextSearchPage, randomInteger(3000, 4000));
        } else {
            $('#progressStatus').addClass(' progress-bar-danger');
            $('#progressStatus').removeClass('active');
            void 0;
            $('#warning2').addClass(' hidden');
            $(window).trigger('contactsSaved', [e_e]);
        }

        currentCompanies = [];
    });
}

function sendCompany_CA() {
    void 0;

    for (var iComp = 0; iComp < currentCompanies.length; iComp++) {
        var bBreak = false;

        var company = currentCompanies[iComp];
        for (var iPeop = 0; iPeop < currentPeopleList.length; iPeop++) {
            if (currentPeopleList[iPeop].current && (currentPeopleList[iPeop].current.length > 0)) {
                for (var iCur = 0; iCur < currentPeopleList[iPeop].current.length; iCur++) {
                    if (currentPeopleList[iPeop].current[iCur].source_id && (currentPeopleList[iPeop].current[iCur].source_id == company.source_id)) {
                        if (!currentPeopleList[iPeop].companies) {
                            currentPeopleList[iPeop].companies = [];
                        }
                        currentPeopleList[iPeop].companies.push(company);
                        bBreak = true;
                        break;
                    }
                }
                if (bBreak) {
                    break;
                }
            }
            if (currentPeopleList[iPeop].previous && (currentPeopleList[iPeop].previous.length > 0)) {
                for (var iPrev = 0; iPrev < currentPeopleList[iPeop].previous.length; iPrev++) {
                    if (currentPeopleList[iPeop].previous[iPrev].source_id && (currentPeopleList[iPeop].previous[iPrev].source_id == company.source_id)) {
                        if (!currentPeopleList[iPeop].companies) {
                            currentPeopleList[iPeop].companies = [];
                        }
                        currentPeopleList[iPeop].companies.push(company);
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

    sendPeople_CA();
}

function checkCurrentCompaniesForSend_2() {
    void 0;


    if ((waitingCompaniesCount > 0) && queueIsEmpty && (processedCompaniesCount == waitingCompaniesCount)) {
        queueIsEmpty = false;
        sendCompany_CA_2();

        waitingCompaniesCount = 0;
        processedCompaniesCount = 0;
    }
}

function checkCurrentCompaniesForSend() {
    void 0;

    if ((processedPeopleCount > 0) && queueIsEmpty && (processedPeopleCount == waitingPeopleCount) && (processedCompaniesCount == waitingCompaniesCount)) {
        waitingCompaniesCount = 0;
        processedCompaniesCount = 0;
        queueIsEmpty = false;

        sendCompany_CA();
    }
}

function getCompany(profileLink, cb) {
    var jqxhr = $.get(profileLink, '', function (response) {

        if (response) {
            var company = getCompanyInfo_C_S(response);
            if (company && company.name && company.source_id) {
                currentCompanies.push(company);
                void 0;
            }
        }
        if (cb) {
            cb();
        }
    });
    jqxhr.fail(function () {
        if (cb) {
            cb();
        }
    });
}

function getPerson(prsn, cb) {

    function processWorks(workArray) {
        for (key in workArray) {
            if ((workArray[key].source_id) && (currentCompIds.indexOf(workArray[key].source_id) < 0) && (cmpnsIds.indexOf(workArray[key].source_id.toString()) < 0)) {
                currentCompIds.push(workArray[key].source_id);

                if (prsn.searchLink.indexOf('https://www.linkedin.com/sales-api/salesApiProfiles/') == 0) {
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

                waitingCompaniesCount++;
                var jqxhr_c = $.get(cUrl, '', function (response) {
                    if (response) {
                        if (prsn.searchLink.indexOf('https://www.linkedin.com/sales-api/salesApiProfiles/') == 0) {
                            var resp = response;
                        } else {
                            var resp = response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
                        }
                        var company = getCompanyInfo_C_S(resp);
                        if (company && company.name && company.source_id) {
                            currentCompanies.push(company);
                            void 0;
                        }

                    }
                    processedCompaniesCount++;
                    checkCurrentCompaniesForSend();
                });
                jqxhr_c.fail(function () {
                    processedCompaniesCount++;
                    checkCurrentCompaniesForSend();
                });
            }
        }
    }

    var jqxhr = $.get(prsn.searchLink, '', function (response) {

        if (response) {
            liAccounts.incLiCounter(liAccount, 1);
            if (response.firstName || response.industry) {
                person = getUserInfo_P_S2(response);
            } else {
                var person = getUserInfo_P_S(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                if (!person) {
                    person = getUserInfo_P_S2(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                }
            }
        }

        if (person && person.name) {
            currentPeopleList.push(person);
            void 0;

            if (person.current && (person.current.length > 0)) {
                var works = person.current;
                processWorks(works);
            }
            if (person.previous && (person.previous.length > 0)) {
                var works = person.previous;
                processWorks(works);
            }
        }

        if (cb) {
            cb(true);
        }

        processedPeopleCount++;
        changeProgresStatus();
        checkCurrentCompaniesForSend();
    });
    jqxhr.fail(function () {
        processedPeopleCount++;
        changeProgresStatus();
        checkCurrentCompaniesForSend();
    });
}

function checkRecentlyUpdatedPeoples(people, cb) {
    var list = {
        ids_2: [],
        ids: []
    };
    for (var iNo = 0; iNo < people.length; iNo++) {
        if (people[iNo].source_id) {
            if (!pplIds.checkSourceIdInCache(people[iNo].source_id)) {
                list.ids.push(people[iNo].source_id);
            }
        }
        if (people[iNo].source_id_2) {
            if (!pplIds.checkSourceIdInCache_2(people[iNo].source_id_2)) {
                list.ids_2.push(people[iNo].source_id_2);
            }
        }
    }

    var jqxhr = $.post(getMainHost() + '/api/getRecentlyUpdatedPeoples', list, function (response) {
        if ((response.result) && (response.list)) {
            recentlyUpdatedPeoples = response.list;
        }
        if (cb) {
            cb();
        }
    });
    jqxhr.fail(function () {
        if (cb) {
            cb();
        }
    });
}

function checkRecentlyUpdatedCompanies(companies, cb) {
    var list = {
        ids: []
    };
    for (var iNo = 0; iNo < companies.length; iNo++) {
        if (companies[iNo].source_id) {
            list.ids.push(companies[iNo].source_id);
        }
    }

    var jqxhr = $.post(getMainHost() + '/api/getRecentlyUpdatedCompanies', list, function (response) {
        if ((response.result) && (response.list)) {
            recentlyUpdatedCompanies = response.list;
        }
        if (cb) {
            cb();
        }
    });
    jqxhr.fail(function () {
        if (cb) {
            cb();
        }
    });
}

function getNextSearchPage() {

    function errorOnPage() {
        void 0;
        void 0;

        $('#progressStatus').addClass(' progress-bar-danger');
        $('#progressStatus').removeClass('active');

        $('#warning2').addClass(' hidden');

        var link = '<a href="' + curSearchUrl + '" target="_blank">page</a>';
        $('#error').html('Error getting data on the ' + link + '. Try to open the ' + link + ' yourself.');
        $('#error').removeClass('hidden');

        $(window).trigger('contactsSaved', [e_e]);
    }

    function waitAndGetPerson() {
        if (iPersonCount < people.length) {
            waitingPeopleCount++;

            if (pplIds.checkSourceIdInCache(people[iPersonCount].source_id) || (recentlyUpdatedPeoples.ids.indexOf(people[iPersonCount].source_id.toString()) > -1)) {
                delete people[iPersonCount].searchLink;
                currentPeopleList.push(people[iPersonCount]);
                void 0;

                processedPeopleCount++;
                changeProgresStatus();
                checkCurrentCompaniesForSend();

                iPersonCount++;

                waitAndGetPerson();
            } else {
                getPerson(people[iPersonCount], function () {
                    iPersonCount++;
                    setTimeout(waitAndGetPerson, randomInteger(sleepValueMin, sleepValueMax));
                });
            }
        } else {
            queueIsEmpty = true;
            checkCurrentCompaniesForSend();
        }
    }

    function waitAndGetCompany() {
        if (iCompanyCount < companies.length) {
            waitingCompaniesCount++;

            if (recentlyUpdatedCompanies.ids.indexOf(companies[iCompanyCount].source_id.toString()) > -1) {
                delete companies[iCompanyCount].searchLink;
                currentCompanies.push(companies[iCompanyCount]);
                void 0;

                iCompanyCount++;

                processedCompaniesCount++;
                checkCurrentCompaniesForSend_2();
                changeProgresStatus_2();

                waitAndGetCompany();
            } else {
                getCompany(companies[iCompanyCount].searchLink, function () {
                    iCompanyCount++;

                    processedCompaniesCount++;
                    checkCurrentCompaniesForSend_2();
                    changeProgresStatus_2();

                    setTimeout(waitAndGetCompany, randomInteger(sleepValueMin, sleepValueMax));
                });
            }
        } else {
            queueIsEmpty = true;
            checkCurrentCompaniesForSend_2();
        }
    }

    if (+iCurPageNo <= +pageNoFinish) {
        var curSearchUrl = searchUrl.replace(/sales\/search/ig, 'sales/search/results');
        if (curSearchUrl.indexOf('&start=') == -1) {
            curSearchUrl = curSearchUrl + '&start=' + (iCurPageNo * peopleCountOnPage - peopleCountOnPage);
        } else {
            curSearchUrl = curSearchUrl.replace(/&start=\d+/i, '&start=' + (iCurPageNo * peopleCountOnPage - peopleCountOnPage));
        }
        if (curSearchUrl.indexOf('&count=') == -1) {
            curSearchUrl += '&count=25';
        }
        if (trackingInfo) {
            if (trackingInfo.moduleKey) {
                if (curSearchUrl.indexOf('trackingInfoJson.contextId') == -1) {
                    curSearchUrl += '&trackingInfoJson.contextId=' + trackingInfo.contextId;
                }
            }
            if (trackingInfo.moduleKey) {
                if (curSearchUrl.indexOf('trackingInfoJson.requestId') == -1) {
                    curSearchUrl += '&trackingInfoJson.requestId=' + trackingInfo.requestId;
                }
            }
        }

        void 0;

        var jqxhr_c = $.get(curSearchUrl, '', function (response) {
            if (response) {

                if (peopleSearch) {
                    void 0;
                    people = getPeopleList_S2(response);
                    trackingInfo = getTrackingInfo(response);

                    if (people && (people.length > 0)) {
                        checkRecentlyUpdatedPeoples(people, function () {
                            iPersonCount = 0;
                            waitAndGetPerson();
                        });
                    } else {
                        errorOnPage();
                    }
                } else {
                    companies = getCompaniesList_S2(response);

                    if (companies && localStorage['csrfToken']) {
                        $.ajaxSetup({
                            headers: {
                                'csrf-token': localStorage['csrfToken'],
                                'x-restli-protocol-version': '2.0.0'
                            },
                            global: false,
                            type: 'GET'
                        })
                    }

                    trackingInfo = getTrackingInfo(response);

                    if (companies) {
                        checkRecentlyUpdatedCompanies(companies, function () {
                            iCompanyCount = 0;
                            waitAndGetCompany();
                        });
                    } else {
                        errorOnPage();
                    }
                }
            }
        });
        jqxhr_c.fail(function () {
            errorOnPage();
        });
    } else {
        void 0;
        $('#warning2').addClass(' hidden');
        $('#progressStatus').removeClass('active');
        $(window).trigger('contactsSaved', [e_e]);
    }
}

function autoSearch(url, start, finish, timeoutMin, timeoutMax, e) {
    if (!url) {
        return undefined;
    }

    searchUrl = url;
    pageNoStart = start;
    pageNoFinish = finish;
    iCurPageNo = pageNoStart;
    sleepValueMin = timeoutMin;
    sleepValueMax = timeoutMax;
    localStorage['sleepValueMin'] = $('#sleepValueMin').val();
    localStorage['sleepValueMax'] = $('#sleepValueMax').val();


    $('#warning2').removeClass('hidden');

    $.ajaxSetup({
        timeout: 10000
    });

    if (localStorage['cmpnsIds']) {
        cmpnsIds = localStorage['cmpnsIds'].split(',');
    }

    e_e = e;
    getNextSearchPage();
}

function getChar(event) {
    if (event.which == null) {
        if (event.keyCode < 32) return null;
        return String.fromCharCode(event.keyCode) 
    }

    if (event.which != 0 && event.charCode != 0) {
        if (event.which < 32) return null;
        return String.fromCharCode(event.which) 
    }

    return null; 
}

function validateNumbers(e) {
    e = e || event;

    if (e.ctrlKey || e.altKey || e.metaKey) return;

    var chr = getChar(e);

    if (chr == null) return;

    if (chr < '0' || chr > '9') {
        return false;
    }
}

function validatePageLimit() {
    if (+this.value > 40) {
        this.value = 40;
    }
}

function detectCurrenPage(url) {
    if (!url) {
        return undefined;
    }

    var fnd = findDescrByRegEx(url, /count=(\d+)/i);
    if (fnd && (+fnd > 0)) {
        peopleCountOnPage = +fnd;
    }

    var start = findDescrByRegEx(url, /&start=(\d+)/i);
    if (start && (+start > 0)) {
        var pageNo = +start / peopleCountOnPage + 1;
        document.getElementById('startPage').value = pageNo;
        document.getElementById('finishPage').value = pageNo + 3;
    }
}

chrome.tabs.getSelected(null, function (tab) {
    chrome.tabs.sendMessage(tab.id, {
        method: 'getInnerHTML'
    }, function (response) {
        if (response && response.data) {
            liAccount = liAccounts.detectAccountAndCheckLimits(response.data, false, true, false);
        }
    });

    detectCurrenPage(tab.url);

    peopleSearch = (tab.url.indexOf('/companies') == -1);

    $(window).on('userListsLoaded', function (event, type, data) {
        $('#startPage').on('keypress', validateNumbers);
        $('#finishPage').on('keypress', validateNumbers);
        $('#startPage').on('change', validatePageLimit);
        $('#sleepValueMin').on('keypress', validateNumbers);
        $('#sleepValueMax').on('keypress', validateNumbers);

        if (localStorage['sleepValueMin']) {
            $('#sleepValueMin').val(localStorage['sleepValueMin']);
        }
        if (localStorage['sleepValueMax']) {
            $('#sleepValueMax').val(localStorage['sleepValueMax']);
        }

        peopleSearch = (tab.url.indexOf('/companies') == -1);

        if (peopleSearch) {
            $('#panelPeople').removeClass('hidden');
            $('#sendPeople').on('click', function (e) {
                autoSearch(tab.url, document.getElementById('startPage').value, document.getElementById('finishPage').value, document.getElementById('sleepValueMin').value, document.getElementById('sleepValueMax').value, e);
            });
            showAvailableLists(data, 'userPeopleSelect', maDefaultListId);
            maDefaultListId = $userPeopleSelect.val();
            $userPeopleSelect.on('change', function () {
                maDefaultListId = $(this).val();
            })
        } else {
            $('#panelCompanies').removeClass('hidden');
            $('#sendCompanies').on('click', function (e) {
                autoSearch(tab.url, document.getElementById('startPage').value, document.getElementById('finishPage').value, document.getElementById('sleepValueMin').value, document.getElementById('sleepValueMax').value, e);
            });
            showAvailableLists(data, 'userCompaniesSelect', maDefaultListId);
            maDefaultListId = $userCompaniesSelect.val();
            $userCompaniesSelect.on('change', function () {
                maDefaultListId = $(this).val();
            })
        }

    });

    if (peopleSearch) {
        getMAList('people', true);
    } else {
        getMAList('company', true);
    }
});