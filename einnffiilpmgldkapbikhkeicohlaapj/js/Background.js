(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-94112226-8', 'auto');
ga('set', 'checkProtocolTask', function () {});

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
    title: 'Background tasks',
    contexts: ['browser_action'],
    onclick: function () {
        chrome.tabs.create({
            url: '../html/backgroundTasks.html'
        });
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, props, tab) {
    if (props.status == 'complete') {};
    if (props.status == 'loading') {}
});

chrome.tabs.onActivated.addListener(function (info) {
    if (info) {
        chrome.tabs.get(info.tabId, function (tab) {
            if (tab) {
                var a = document.createElement('a');
                a.href = tab.url;
                if (a.hostname == mHost) {
                    if (localStorage['needUpdateMA']) {
                        localStorage['needUpdateMA'] = '';
                        chrome.tabs.reload(tab.id);
                    }
                }
            }
        });
    }
});

chrome.runtime.onStartup.addListener(function (details) {
    if (localStorage['cmpnsIds']) {
        var cmpnsIds = localStorage['cmpnsIds'].split(',');
        if (cmpnsIds.length > 10000) {
            cmpnsIds.splice(0, cmpnsIds.length - 5000);
            localStorage['cmpnsIds'] = cmpnsIds.join(',');
        }
    }

    pplIds = new peoplesCache();
    pplIds.deleteOldIds(14);
    pplIds = undefined;
});

chrome.runtime.onInstalled.addListener(function (details) {

    if (details.reason == 'install') {
        var newURL = 'https://app.snov.io/register?ref=extension';
        chrome.tabs.create({
            url: newURL
        }, function (tab) {
        });

        ga('send', 'event', {
            eventCategory: 'SnovioExt',
            eventAction: 'install',
        });

    } else if (details.reason == 'update') {
        var thisVersion = chrome.runtime.getManifest().version;
        if (thisVersion !== details.previousVersion) {

        }
    }
});

chrome.runtime.setUninstallURL('https://app.snov.io/deleteChromeExtension');

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.needUpdateUserLists) {
        localStorage['needUpdateUserLists'] = 1;
    }
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        for (var iNo = 0; iNo < details.requestHeaders.length; iNo++) {
            if (details.requestHeaders[iNo].name.toLowerCase() === 'csrf-token') {
                localStorage['csrfToken'] = details.requestHeaders[iNo].value;
                break;
            }
        }
        return {
            requestHeaders: details.requestHeaders
        };
    }, {
        urls: ['https://www.linkedin.com/sales-api/*/*']
    }, ['requestHeaders']
);