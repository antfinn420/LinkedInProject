var keyLi = 'liAccounts';

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.function == 'detectAccountInfo') {
        sendResponse(liAccounts.detectAccountInfo(request.source, request.defInt, request.salInt, request.recInt));
    }
    if (request.function == 'incCounter') {
        sendResponse(liAccounts.detectAccountAndIncCounter(request.source, request.defInt, request.salInt, request.recInt));
    }
});

chrome.tabs.onUpdated.addListener(function (tabId, props, tab) {
    if (props.status == 'complete') {
        if (tab.url.indexOf('https://www.linkedin.com') !== -1) {
            if (tab.url.indexOf('https://www.linkedin.com/in/') !== -1) {
                chrome.tabs.sendMessage(tab.id, {
                    method: 'getInnerHTML'
                }, function (response) {
                    if (response && response.data) {
                        liAccounts.detectAccountAndIncCounter(response.data, true, false, false);
                    }
                });
            } else {
                if ((tab.url.indexOf('https://www.linkedin.com/sales/profile/') !== -1) || (tab.url.indexOf('https://www.linkedin.com/sales/people/') !== -1)) {
                    chrome.tabs.sendMessage(tab.id, {
                        method: 'getInnerHTML'
                    }, function (response) {
                        if (response && response.data) {
                            liAccounts.detectAccountAndIncCounter(response.data, false, true, false);
                        }
                    });
                }
            }
        }

    };
});

class accountsLI {
    get constAcTypeDef() {
        return INTERFACE_DEF;
    }
    get constAcTypeSales() {
        return INTERFACE_SN;
    }
    get constAcTypeRecruiter() {
        return INTERFACE_REC;
    }



    get constLimitDef() {
        return 135;
    }
    get constLimitDefPay() {
        return 495;
    }
    get constLimitSales() {
        return 1395;
    }

    detectAccountInfoDef(source) {
        source = source.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
        var reg = /<code.+>([\s\S]+?)<\/code>/gi;
        var matches;
        while (matches = reg.exec(source)) {
            if (matches && matches[1]) {
                var obj = {};
                try {
                    obj = JSON.parse(matches[1].trim());
                    if (obj && obj.data && obj.included && (obj.included.length > 2)) {
                        if (obj.data.plainId) {
                            for (var iNo = 0; iNo < obj.included.length; iNo++) {
                                if (obj.included[iNo].lastName) {
                                    var name = obj.included[iNo].firstName + ' ' + obj.included[iNo].lastName;
                                    break;
                                }
                            }

                            return {
                                acType: this.constAcTypeDef,
                                acPaid: (obj.data.premiumSubscriber),
                                acName: name,
                            }
                        }
                    }
                } catch (e) {}
            }
        }
    }

    detectAccountInfoSales(source) {
        source = source.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
        var reg = /class="person-entity.*?".*alt="(.+?)"/i;
        var matches = reg.exec(source);
        if (matches && matches[1]) {
            return {
                acType: this.constAcTypeSales,
                acPaid: true,
                acName: matches[1].trim()
            }
        } else {
            var reg = /<code style="display: none".*?>[\s\S]+onboarded.+"fullName":"(.+?)"[\s\S]+?<\/code>/i;
            var matches = reg.exec(source);
            if (matches && matches[1]) {
                return {
                    acType: this.constAcTypeSales,
                    acPaid: true,
                    acName: matches[1].trim()
                }
            } else {
                var reg = /class="person-ghost.*?"/i;
                var matches = reg.exec(source);
                if (matches) {
                    return {
                        acType: this.constAcTypeSales,
                        acPaid: true,
                        acName: 'Ghost (no profile photo)'
                    }
                } else {
                    return {
                        acType: this.constAcTypeSales,
                        acPaid: true,
                        acName: 'Undefined'
                    }
                }
            }

        }
    }

    detectAccountInfoRecruiter(source) {
        return {
            acType: this.constAcTypeRecruiter,
            acPaid: true
        }
    }

    detectAccountInfo(source, defInt, salInt, recInt) {
        var accountInfo = {};
        if (defInt) {
            return this.detectAccountInfoDef(source);
        } else if (salInt) {
            return this.detectAccountInfoSales(source);
        } else if (recInt) {

        }
    }

    checkLimits(account) {
        if (account) {
            chrome.storage.local.get('liAccounts', function (result) {
                if (result) {
                    var resp = false;

                    var curDate = (new Date().setHours(0, 0, 0, 0)).toString();

                    if (result[keyLi] && result[keyLi][curDate]) {
                        if (account.acType == liAccounts.constAcTypeDef) {
                            if (result[keyLi][curDate][account.acName].acDefCountWarning && !result[keyLi][curDate][account.acName].acDefCountIgnore) {
                                resp = true;
                            }
                        }
                        if (account.acType == liAccounts.constAcTypeSales) {
                            if (result[keyLi][curDate][account.acName].acSalesCountWarning && !result[keyLi][curDate][account.acName].acSalesCountIgnore) {
                                resp = true;
                            }
                        }
                        if (account.acType == liAccounts.constAcTypeRecruiter) {}
                    }

                    if (resp && window && (window.location.href.indexOf('generated_background_page') == -1)) {
                        window.location.href = "../html/showLimitationLI.html";
                    }
                }
            });
        }
    }

    incLiCounter(account, pageCount) {
        var curDate = (new Date().setHours(0, 0, 0, 0)).toString();

        if (!account || !curDate) {
            return;
        }
        if (!pageCount) {
            pageCount = 1;
        }
        chrome.storage.local.get('liAccounts', function (result) {
            if (result) {
                if (!result[keyLi]) {
                    result[keyLi] = {}
                }
                if (!result[keyLi][curDate]) {
                    result[keyLi][curDate] = {};
                }

                if (!result[keyLi][curDate][account.acName]) {
                    result[keyLi][curDate][account.acName] = {
                        acDefCount: 0,
                        acSalesCount: 0,
                        acRecCount: 0
                    };
                }
                if (account.acPaid) {
                    result[keyLi][curDate][account.acName].acPaid = true;
                }

                if (account.acType == liAccounts.constAcTypeDef) {
                    result[keyLi][curDate][account.acName].acDefCount += pageCount;

                    if (result[keyLi][curDate][account.acName].acPaid) {
                        if (result[keyLi][curDate][account.acName].acDefCount > liAccounts.constLimitDefPay) {
                            result[keyLi][curDate][account.acName].acDefCountWarning = true;
                        }
                    } else {
                        if (result[keyLi][curDate][account.acName].acDefCount > liAccounts.constLimitDef) {
                            result[keyLi][curDate][account.acName].acDefCountWarning = true;
                        }
                    }
                }
                if (account.acType == liAccounts.constAcTypeSales) {
                    result[keyLi][curDate][account.acName].acSalesCount += pageCount;
                    if (result[keyLi][curDate][account.acName].acSalesCount > liAccounts.constLimitSales) {
                        result[keyLi][curDate][account.acName].acSalesCountWarning = true;
                    }
                }
                if (account.acType == liAccounts.constAcTypeRecruiter) {
                    result[keyLi][curDate][account.acName].acRecCount += pageCount;
                }

                chrome.storage.local.set({
                    'liAccounts': result[keyLi]
                }, function () {
                    void 0;
                });
            }
        });
    }

    detectAccountAndIncCounter(source, defInt, salInt, recInt) {
        var accountInfo = this.detectAccountInfo(source, defInt, salInt, recInt);
        this.incLiCounter(accountInfo);
    }

    detectAccountAndCheckLimits(source, defInt, salInt, recInt) {
        var accountInfo = this.detectAccountInfo(source, defInt, salInt, recInt);
        liAccounts.checkLimits(accountInfo);
        return accountInfo;
    }

    constructor() {}
};

var liAccounts = new accountsLI();