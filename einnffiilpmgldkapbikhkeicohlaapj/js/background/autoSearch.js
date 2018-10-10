class AutoSearchLI extends TaskLI {
    constructor(task) {
        super();

        this.interface = task.interface;
        this.searchFilters = task.searchFilters;
        if (!this.searchFilters) {
            this.searchFilters = 'Unspecified';
        } else {
            if (this.searchFilters.length > 150) {
                this.searchFilters = this.searchFilters.substring(0, 149) + '...';
            }
        }

        this.urlStart = task.urlStart;
        this.urlCurrent = task.urlStart;
        this.maListId = task.maListID;
        this.userListname = task.userListname;
        this.list = task.list;

        this.pageStart = +task.pageStart;
        this.pageFinish = +task.pageFinish;
        this.pageCurrent = +task.pageStart;

        this.timeoutMin = 3000;
        this.timeoutMax = 7000;
        if (task.timeoutMin) {
            this.timeoutMin = task.timeoutMin * 1000;
        }
        if (task.timeoutMax) {
            this.timeoutMax = task.timeoutMax * 1000;
        }

        this.peopleCountOnPage = 10;
        this.allSendPeoplesCount = 0;

        this.profilesProcessed = 0;
        this.pagesProcessed = 0;

        this.trackingInfo = undefined;

        this.recentlyUpdatedPeoples = {
            ids_2: [],
            ids: []
        };
        this.currentCompIds = [];
        this.cmpnsIds = [];
        this.pplIds = new peoplesCache();

        this.people = [];
        this.currentPeopleList = [];
        this.profilesParsed = 0;
        this.profilesWaiting = 0;
        this.currentCompanies = [];
        this.companiesProcessed = 0;
        this.companiesWaiting = 0;
        this.queueIsEmpty = false;

        this.error = false;
        this.errorText = '';
        this.errorCode = -1;

        this.liAccount = task.liAccount;
    }

    stop() {
        super.stop();

        this.people = [];
        this.cmpnsIds = null;
        this.pplIds = null;
        this.recentlyUpdatedPeoples = null;
        this.currentCompIds = null;
        this.urlCurrent = null;
        this.urlStart = null;
        this.list = null;
        this.trackingInfo = null;
        this.liAccount = null;
        this.currentCompanies = null;
        this.currentPeopleList = null;
    }

    start() {
        super.start();

        if (localStorage['cmpnsIds']) {
            this.cmpnsIds = localStorage['cmpnsIds'].split(',');
        }

        this.goToNextSearchPage();
    }

    getUserInfo(source) {
    }

    getCompanyUrl(id) {
    }

    getCompanyInfo(source) {
    }

    getPeopleList(source) {
    }

    getSearchLink(link) {
        return link;
    }

    getCurrentSearchUrl(curSearchUrl) {
        if (curSearchUrl.indexOf('&start=') == -1) {
            curSearchUrl = curSearchUrl + '&start=' + (this.pageCurrent * this.peopleCountOnPage - this.peopleCountOnPage);
        } else {
            curSearchUrl = curSearchUrl.replace(/&start=\d+/i, '&start=' + (this.pageCurrent * this.peopleCountOnPage - this.peopleCountOnPage));
        }

        if (this.trackingInfo) {
            if (this.trackingInfo.moduleKey) {
                if (curSearchUrl.indexOf('trackingInfoJson.contextId') == -1) {
                    curSearchUrl += '&trackingInfoJson.contextId=' + this.trackingInfo.contextId;
                }
            }
            if (this.trackingInfo.moduleKey) {
                if (curSearchUrl.indexOf('trackingInfoJson.requestId') == -1) {
                    curSearchUrl += '&trackingInfoJson.requestId=' + this.trackingInfo.requestId;
                }
            }
        }

        return curSearchUrl;
    }

    errorOnPage() {
        if (this.stop()) {
            this.stop();
        }
    }

    checkRecentlyUpdatedPeoples(people, callback) {
        var list = {
            ids_2: [],
            ids: []
        };
        for (var iNo = 0; iNo < people.length; iNo++) {
            if (people[iNo].source_id) {
                if (!this.pplIds.checkSourceIdInCache(people[iNo].source_id)) {
                    list.ids.push(people[iNo].source_id);
                }
            }
            if (people[iNo].source_id_2) {
                if (!this.pplIds.checkSourceIdInCache_2(people[iNo].source_id_2)) {
                    list.ids_2.push(people[iNo].source_id_2);
                }
            }
        }

        var this_ = this;
        var jqxhr = $.post(getMainHost() + '/api/getRecentlyUpdatedPeoples', list, function (response) {
            if ((response.result) && (response.list)) {
                this_.recentlyUpdatedPeoples = response.list;
            }
            if (callback) {
                callback();
            }
        });
        jqxhr.fail(function (e) {
            void 0;
            if (callback) {
                callback();
            }
        });
    }

    waitAndGetPerson() {
        if (this.isFinished) return;

        void 0;
        if (this.profilesParsed < this.people.length) {
            this.profilesWaiting++;

            if ((this.people[this.profilesParsed].source_id && (this.pplIds.checkSourceIdInCache(this.people[this.profilesParsed].source_id) ||
                    (this.recentlyUpdatedPeoples.ids.indexOf(this.people[this.profilesParsed].source_id) > -1))) ||
                (this.people[this.profilesParsed].source_id_2 && (this.pplIds.checkSourceIdInCache_2(this.people[this.profilesParsed].source_id_2) ||
                    (this.recentlyUpdatedPeoples.ids_2.indexOf(this.people[this.profilesParsed].source_id_2) > -1)))) {

                if (this.people[this.profilesParsed].searchLink) {
                    delete this.people[this.profilesParsed].searchLink;
                }
                if (this.people[this.profilesParsed].description) {
                    delete this.people[this.profilesParsed].description;
                }
                if (this.people[this.profilesParsed].logo) {
                    delete this.people[this.profilesParsed].logo;
                }
                if (this.people[this.profilesParsed].locality) {
                    delete this.people[this.profilesParsed].locality;
                }
                if (this.people[this.profilesParsed].index_num) {
                    delete this.people[this.profilesParsed].index_num;
                }

                this.currentPeopleList.push(this.people[this.profilesParsed]);
                void 0;

                this.profilesProcessed++;
                this.checkCurrentCompaniesForSend();

                this.profilesParsed++;

                this.waitAndGetPerson();
            } else {
                var this_ = this;
                this.getPerson(this.people[this.profilesParsed], function () {
                    this_.profilesParsed++;

                    if (this_.profilesParsed < this_.people.length) {
                        setTimeout(this_.waitAndGetPerson.bind(this_), randomInteger(this_.timeoutMin, this_.timeoutMax));
                    } else {
                        this_.waitAndGetPerson();
                    }
                });
            }
        } else {
            this.queueIsEmpty = true;
            this.checkCurrentCompaniesForSend();
        }
    }

    getPerson(prsn, cb) {

        if (this.isFinished) return;

        function processWorks(workArray) {
            for (var key in workArray) {
                if ((workArray[key].source_id) && (this_.currentCompIds.indexOf(workArray[key].source_id) < 0) && (this_.cmpnsIds.indexOf(workArray[key].source_id.toString()) < 0)) {
                    this_.currentCompIds.push(workArray[key].source_id);

                    var cUrl = this_.getCompanyUrl(workArray[key].source_id);

                    this_.companiesWaiting++;

                    var jqxhr_c = $.get(cUrl, '', function (response) {
                        if (response) {
                            var company = this_.getCompanyInfo(response);
                            if (company && company.name && company.source_id) {
                                this_.currentCompanies.push(company);
                            }

                        }
                        this_.companiesProcessed++;
                        this_.checkCurrentCompaniesForSend();
                    });
                    jqxhr_c.fail(function (e) {
                        void 0;
                        this_.companiesProcessed++;
                        this_.checkCurrentCompaniesForSend();
                    });
                }
            }
        }

        var this_ = this;
        var sLink = this.getSearchLink(prsn.searchLink);

        if ((this.interface == INTERFACE_SN) && localStorage['csrfToken']) {
            $.ajaxSetup({
                headers: {
                    'csrf-token': localStorage['csrfToken'],
                    'x-restli-protocol-version': '2.0.0'
                },
                global: false,
                type: 'GET'
            });
        }

        var jqxhr = $.get(sLink, '', function (response) {

            if (response) {
                liAccounts.incLiCounter(this_.liAccount, 1);

                var person = this_.getUserInfo(response);
            }

            if (person && person.name) {
                this_.currentPeopleList.push(person);

                if (person.current && (person.current.length > 0)) {
                    processWorks(person.current);
                }
                if (person.previous && (person.previous.length > 0)) {
                    processWorks(person.previous);
                }
            }

            if (cb) {
                cb();
            }

            this_.profilesProcessed++;
            this_.checkCurrentCompaniesForSend();
        });
        jqxhr.fail(function (e) {
            void 0;

            if (e.status == 999) {
                this_.error = true;
                this_.errorCode = 999;
                chrome.notifications.create('LI_AUTH', {
                    type: 'basic',
                    iconUrl: '../img/48.png',
                    title: 'Snovio Email Finder',
                    message: 'Active search task has been stopped. Try to re-login into your LinkedIn account to restart the search.',
                    contextMessage: 'We have lost a connection to your LinkedIn account.'
                }, (notificationId) => {});

                this_.stop();
            } else {
                this_.profilesProcessed++;
                this_.checkCurrentCompaniesForSend();

                if (cb) {
                    cb();
                }
            }
        });
    }

    checkCurrentCompaniesForSend() {
        if (this.isFinished) return;

        void 0;

        if ((this.profilesProcessed > 0) && this.queueIsEmpty && (this.profilesProcessed == this.profilesWaiting) && (this.companiesProcessed == this.companiesWaiting)) {
            this.companiesWaiting = 0;
            this.companiesProcessed = 0;
            this.queueIsEmpty = false;

            this.prepareCompaniesForSend();
        }
    }

    prepareCompaniesForSend() {
        if (this.isFinished) return;

        void 0;

        for (var iComp = 0; iComp < this.currentCompanies.length; iComp++) {
            var bBreak = false;

            var company = this.currentCompanies[iComp];
            for (var iPeop = 0; iPeop < this.currentPeopleList.length; iPeop++) {
                if (this.currentPeopleList[iPeop].current && (this.currentPeopleList[iPeop].current.length > 0)) {
                    for (var iCur = 0; iCur < this.currentPeopleList[iPeop].current.length; iCur++) {
                        if (this.currentPeopleList[iPeop].current[iCur].source_id && (this.currentPeopleList[iPeop].current[iCur].source_id == company.source_id)) {
                            if (!this.currentPeopleList[iPeop].companies) {
                                this.currentPeopleList[iPeop].companies = [];
                            }
                            this.currentPeopleList[iPeop].companies.push(company);
                            bBreak = true;
                            break;
                        }
                    }
                    if (bBreak) {
                        break;
                    }
                }
                if (this.currentPeopleList[iPeop].previous && (this.currentPeopleList[iPeop].previous.length > 0)) {
                    for (var iPrev = 0; iPrev < this.currentPeopleList[iPeop].previous.length; iPrev++) {
                        if (this.currentPeopleList[iPeop].previous[iPrev].source_id && (this.currentPeopleList[iPeop].previous[iPrev].source_id == company.source_id)) {
                            if (!this.currentPeopleList[iPeop].companies) {
                                this.currentPeopleList[iPeop].companies = [];
                            }
                            this.currentPeopleList[iPeop].companies.push(company);
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

        this.sendPeople();
    }

    sendPeople() {
        if (this.isFinished) return;

        if (!this.maListId) {
            var params = 'listName=' + this.userListname + '&list=' + encodeURIComponent(convertHtmlToText(JSON.stringify(this.currentPeopleList)));
        } else {
            var params = 'listId=' + this.maListId + '&list=' + encodeURIComponent(convertHtmlToText(JSON.stringify(this.currentPeopleList)));
        }
        void 0;
        var this_ = this;
        $.post(getMainHost() + '/api/createPeople', params, function (response) {
            localStorage['needUpdateMA'] = 1;

            void 0;

            this_.profilesWaiting = 0;
            this_.profilesProcessed = 0;
            this_.allSendPeoplesCount += this_.currentPeopleList.length;

            this_.pageCurrent++;

            if (response.result) {
                if (this_.currentCompanies && (this_.currentCompanies.length > 0)) {
                    for (var iNo = 0; iNo < this_.currentCompanies.length; iNo++) {
                        this_.cmpnsIds.push(this_.currentCompanies[iNo].source_id);
                    }
                    localStorage['cmpnsIds'] = this_.cmpnsIds.join(',');
                    this_.currentCompanies = [];
                }
                for (var iNo = 0; iNo < this_.currentPeopleList.length; iNo++) {
                    this_.pplIds.addSourceIdToCache(this_.currentPeopleList[iNo].source_id);
                }
                this_.pplIds.saveToStorage();

                liAccounts.checkLimits(this_.liAccount);

                setTimeout(this_.goToNextSearchPage.bind(this_), randomInteger(3000, 4000));
            } else {
                void 0;
                this_.error = true;
                if (response.message) {
                    this_.errorText = response.message;
                }
                if (response.code) {
                    this_.errorCode = response.code;
                }
                if (response.code == 8) {
                    chrome.notifications.create('NO_CREDITS', {
                        type: 'basic',
                        iconUrl: '../img/48.png',
                        title: 'Snovio Email Finder',
                        message: 'Sorry, your paid plan has reached its limits. Please order more credits.',
                        contextMessage: 'Not enough credits in your account.',
                        buttons: [{
                            title: 'Get more credits'
                        }]
                    }, (notificationId) => {});
                }
                this_.stop();
            }

            this_.currentPeopleList = [];
        });
    }

    goToNextSearchPage() {

        if (this.isFinished) return;

        function getResponse(response) {

            if (!response && this_.list) {
                this_.people = this_.list;
                this_.list = undefined;
            } else {
                this_.people = this_.getPeopleList(response);
            }

            if (this_.getTrackingInfo) {
                this_.trackingInfo = this_.getTrackingInfo(response);
            }

            if (this_.people && (this_.people.length > 0)) {
                this_.checkRecentlyUpdatedPeoples(this_.people, function () {
                    this_.profilesParsed = 0;
                    this_.waitAndGetPerson();
                });
            } else {
                this_.errorOnPage();
            }
        };

        if (+this.pageCurrent <= +this.pageFinish) {

            this.urlCurrent = this.getCurrentSearchUrl(this.urlCurrent);

            var this_ = this;

            if (this.list) {
                getResponse();
            } else {
                var jqxhr_c = $.get(this.urlCurrent, '', getResponse);

                jqxhr_c.fail(function (e) {
                    void 0;
                    this_.errorOnPage();
                });
            }

        } else {
            this.stop();
        }
    }
}