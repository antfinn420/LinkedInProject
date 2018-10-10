var searchUrl = '';
var searchUrlRec = '';
var pageNoStart = 1;
var pageNoFinish = 5;
var iCurPageNo = 1;
var sleepValueMin = 250;
var sleepValueMax = 350;

var maDefaultListId = 0;
var $userPeopleSelect = $('#userPeopleSelect');

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

var e_e;
var cmpnsIds = [];
var pplIds = new peoplesCache();
var recentlyUpdatedPeoples = { ids_2: [], ids: [] };

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
                if (currentPeopleList[iNo].source_id) {
                    pplIds.addSourceIdToCache(currentPeopleList[iNo].source_id);
                }
                if (currentPeopleList[iNo].source_id_2) {
                    pplIds.addSourceIdToCache_2(currentPeopleList[iNo].source_id_2);
                }
            }
            pplIds.saveToStorage();

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

function checkCurrentCompaniesForSend() {
    void 0;

    if ((processedPeopleCount > 0) && queueIsEmpty && (processedPeopleCount == waitingPeopleCount) && (processedCompaniesCount == waitingCompaniesCount)) {
        waitingCompaniesCount = 0;
        processedCompaniesCount = 0;
        queueIsEmpty = false;

        sendCompany_CA();
    }
}

function getPerson(prsn, cb) {

    function processWorks(workArray) {
        for (key in workArray) {

            if ((workArray[key].source_id) && (currentCompIds.indexOf(workArray[key].source_id) < 0) && (cmpnsIds.indexOf(workArray[key].source_id.toString()) < 0)) {
                currentCompIds.push(workArray[key].source_id);
                var cUrl = 'https://www.linkedin.com/recruiter/company/' + workArray[key].source_id;
                waitingCompaniesCount++;
                var jqxhr_c = $.get(cUrl, '', function (response) {
                    if (response) {
                        var resp = response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
                        var company = getCompanyInfo_C_R(resp);
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
            var person = getUserInfo_P_R(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
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
    var list = { ids_2: [], ids: [] };
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

    if (+iCurPageNo <= +pageNoFinish) {
        var curSearchUrl = searchUrl;
        var curSearchUrlRec = searchUrlRec;

        if (curSearchUrl.indexOf('&start=') == -1) {
            curSearchUrl = curSearchUrl + '&start=' + (iCurPageNo * peopleCountOnPage - peopleCountOnPage);
            curSearchUrlRec = curSearchUrlRec + '&start=' + (iCurPageNo * peopleCountOnPage - peopleCountOnPage);
        } else {
            curSearchUrl = curSearchUrl.replace(/&start=\d+/i, '&start=' + (iCurPageNo * peopleCountOnPage - peopleCountOnPage));
            curSearchUrlRec = curSearchUrlRec.replace(/&start=\d+/i, '&start=' + (iCurPageNo * peopleCountOnPage - peopleCountOnPage));
        }

        void 0;

        var jqxhr_c = $.get(curSearchUrlRec, '', function (response) {
            void 0;
            if (response) {

                people = getPeopleList_R(response);

                if (people && (people.length > 0)) {
                    checkRecentlyUpdatedPeoples(people, function () {
                        iPersonCount = 0;
                        waitAndGetPerson();
                    });
                } else {
                    errorOnPage();
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


    var searchHistoryId = findDescrByRegEx(searchUrl, /(searchHistoryId=\d+&)/i);
    var searchCacheKey = findDescrByRegEx(searchUrl, /(searchCacheKey=.*?&)/i);
    var linkContext = findDescrByRegEx(searchUrl, /(linkContext=.*?&)/i);
    searchUrlRec = 'https://www.linkedin.com/recruiter/api/smartsearch?reset=PATL&reset=ECTL&reset=LRTL&reset=sortBy&';
    searchUrlRec += searchHistoryId + searchCacheKey + linkContext;
    searchUrlRec += '&doExplain=false&start=' + (iCurPageNo * 25) + '&origin=PAGE';

    $('#warning2').removeClass('hidden');

    $.ajaxSetup({ timeout: 10000 });

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


    var start = findDescrByRegEx(url, /&start=(\d+)/i);
    if (start && (+start > 0)) {
        var pageNo = +start / peopleCountOnPage + 1;
        document.getElementById('startPage').value = pageNo;
        document.getElementById('finishPage').value = pageNo + 3;
    }
}

chrome.tabs.getSelected(null, function (tab) {
    detectCurrenPage(tab.url);

    getMAList('people', true);

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

        $('#sendPeople').on('click', function (e) {
            autoSearch(tab.url, document.getElementById('startPage').value, document.getElementById('finishPage').value, document.getElementById('sleepValueMin').value, document.getElementById('sleepValueMax').value, e);
        });

        void 0;

        showAvailableLists(data, 'userPeopleSelect', maDefaultListId);

        maDefaultListId = $userPeopleSelect.val();

        $userPeopleSelect.on('change', function () {
            maDefaultListId = $(this).val();
        })

    });
});
