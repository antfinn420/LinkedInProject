var interface = INTERFACE_DEF;
var searchFilters = '';

function detectSearchFilters(tab) {

    chrome.tabs.sendMessage(tab.id, {
        method: 'getInnerHTML'
    }, function (response) {
        if (response && response.data) {
            if (interface == INTERFACE_SN) {
                var reg = /class=".*?selected-filters-list.*?".*?>(.+?)</i;
                var res = findDescrByRegEx(response.data, reg);
                if (res) {
                    searchFilters = res;
                } else {
                    var reg = /keywords=(.*?)&/i;
                    searchFilters = findDescrByRegEx(tab.url, reg);

                    var reg = /class="artdeco-pill-label-text.*?>(.+?)</ig;
                    var matches;
                    while (matches = reg.exec(response.data)) {
                        if (matches[1] && (['Locations', 'Connections', 'Current companies'].indexOf(matches[1]) == -1)) {
                            if (searchFilters) {
                                searchFilters = searchFilters + ', ';
                            }
                            searchFilters = searchFilters + matches[1];
                        }
                    }
                    if (searchFilters) {
                        searchFilters = decodeURIComponent(searchFilters);
                    }
                }
                if ((tab.url.indexOf('sales/search/people') !== -1) && (tab.url.indexOf('&page=') == -1)) {
                    $('#finishPage').attr('title', 'Change any of the search options and try again');
                    $('#finishPage').attr('disabled', true);
                }
            } else {
                var reg = /keywords=(.*?)&/i;
                searchFilters = findDescrByRegEx(tab.url, reg);

                var reg = /class="search-s-facet__name.+>(.+?)</ig;
                var matches;
                while (matches = reg.exec(response.data)) {
                    if (matches[1] && (['Locations', 'Connections', 'Current companies'].indexOf(matches[1]) == -1)) {
                        if (searchFilters) {
                            searchFilters = searchFilters + ', ';
                        }
                        searchFilters = searchFilters + matches[1];
                    }
                }
                if (searchFilters) {
                    searchFilters = decodeURIComponent(searchFilters);
                }
            }
        }
    });
}

chrome.tabs.getSelected(null, function (tab) {
    addHeader();

    if (tab.url.indexOf('/sales/search') > 0) {
        interface = INTERFACE_SN;
    }

    detectSearchFilters(tab);


    $('#startPage').on('keypress', validateNumbers);
    $('#finishPage').on('keypress', validateNumbers);
    $('#startPage').on('change', validatePageLimit);
    $('#finishPage').on('change', validatePageLimit);
    $('#sleepValueMin').on('keypress', validateNumbers);
    $('#sleepValueMax').on('keypress', validateNumbers);
    $('#sleepValueMin').on('change', validateSleepValue);
    $('#sleepValueMax').on('change', validateSleepValue);

    if (localStorage['sleepValueMinNew']) {
        $('#sleepValueMin').val(localStorage['sleepValueMinNew']);
    }
    if (localStorage['sleepValueMaxNew']) {
        $('#sleepValueMax').val(localStorage['sleepValueMaxNew']);
    }
    detectCurrenPage(tab.url);

    $('#panelPeople').removeClass('hidden');
    $('#sendPeople').on('click', function (e) {
        var listID = localStorage[LS_LastPeopleListId];
        if (!listID) {
            listID = localStorage['userListname'];
        }

        localStorage['sleepValueMinNew'] = $('#sleepValueMin').val();
        localStorage['sleepValueMaxNew'] = $('#sleepValueMax').val();

        var people = '';
        try {
            people = JSON.parse(localStorage['people']);
        } catch (e) {}

        var account = '';
        try {
            account = JSON.parse(localStorage['liAccount']);
        } catch (e) {}

        chrome.runtime.sendMessage({
            type: 'addTask',
            interface: interface,
            urlStart: tab.url,
            list: people,
            maListID: localStorage[LS_LastPeopleListId],
            pageStart: document.getElementById('startPage').value,
            pageFinish: document.getElementById('finishPage').value,
            timeoutMin: document.getElementById('sleepValueMin').value,
            timeoutMax: document.getElementById('sleepValueMax').value,
            searchFilters: searchFilters,
            userListname: localStorage['userListname'],
            liAccount: account
        }, function (response) {
            void 0;
            $(window).trigger('contactsSaved', [e]);
            window.location.href = '../html/backgroundTasks.html';
        });

    });

});

function validateNumbers(e) {
    e = e || event;

    if (e.ctrlKey || e.altKey || e.metaKey) return;

    var chr = getChar(e);

    if (chr == null) return;

    if (chr < '0' || chr > '9') {
        return false;
    }
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

function validatePageLimit() {
    if (interface == INTERFACE_SN) {
        if (+this.value > 40) {
            this.value = 40;
        } else {
            if (+this.value > 100) {
                this.value = 100;
            }
        }
    }
}

function validateSleepValue() {
    if (+this.value > 120) {
        this.value = 120;
    }
    if (+this.value < 1) {
        this.value = 1;
    }
}

function detectCurrenPage(url) {
    if (!url) {
        return undefined;
    }

    var pageNo = 1;

    if (interface == INTERFACE_SN) {
        if (url.indexOf('&page=') !== -1) {
            var pageNo = findDescrByRegEx(url, /&page=(\d+)/i);
        } else {
            var peopleCountOnPage = 25;
            var fnd = findDescrByRegEx(url, /count=(\d+)/i);
            if (fnd && (+fnd > 0)) {
                peopleCountOnPage = +fnd;
            }

            var start = findDescrByRegEx(url, /&start=(\d+)/i);
            if (start && (+start > 0)) {
                var pageNo = +start / peopleCountOnPage + 1;
            }
        }
    } else {
        var start = findDescrByRegEx(url, /&page=(\d+)/i);
        if (start && (+start > 0)) {
            pageNo = start;
        }
    }

    document.getElementById('startPage').value = pageNo;
    document.getElementById('finishPage').value = pageNo;
}