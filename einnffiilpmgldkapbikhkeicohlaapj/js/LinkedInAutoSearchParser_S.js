const REG_JSON_BLOCKS_AS = /<code.+?><!--([\s\S]+?)--><\/code>/ig;

function getDataFromPage_AS_S(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS_AS.exec(source)) {
        if (matches[1]) {
            var obj = {};
            try {
                obj = JSON.parse(matches[1].trim());
                if (obj) {
                    arData.push(obj);
                }
            } catch (e) {
                try {
                    var resp = matches[1].trim().replace(/\\n\\n"/ig, ' ').replace(/"\\n\\n/ig, ' ');
                    obj = JSON.parse(resp);
                    if (obj) {
                        arData.push(obj);
                    }
                } catch (e) {
                    try {
                        var resp = resp.replace(/""/ig, '" "');
                        resp = resp.replace(/\s".*?"\s/ig, ' ');
                        obj = JSON.parse(resp);
                        if (obj) {
                            arData.push(obj);
                        }
                    } catch (e) {
                        try {
                            var resp = $("<textarea/>").html(resp).text();
                            obj = JSON.parse(resp);
                            if (obj) {
                                arData.push(obj);
                            }
                        } catch (e) {
                        }
                    }
                }
            }
        }
    }
    return arData;
}

function getMasByKey_AS_S(data) {
    for (var iMain = 0; iMain < data.length; iMain++) {
        if (data[iMain].searchResults && (data[iMain].searchResults.length > 0)) {
            if (data[iMain].searchResults[0].member && data[iMain].searchResults[0].member.authToken && data[iMain].searchResults[0].member.memberId) {
                return data[iMain].searchResults;
            }
        }
    }
}

function getMasByKey_AS_S_2(data) {
    for (var iMain = 0; iMain < data.length; iMain++) {
        if (data[iMain].searchResults && (data[iMain].searchResults.length > 0)) {
            if (data[iMain].searchResults[0].companyId) {
                return data[iMain].searchResults;
            }
        }
    }
}

function getCompaniesLinks(data, ids) {
    var result = [];
    for (var iMain = 0; iMain < data.length; iMain++) {
        if (data[iMain].companyId) {
            var company = {};
            company.searchLink = 'https://www.linkedin.com/sales/accounts/insights?companyId=' + data[iMain].companyId;
            company.source_id = data[iMain].companyId;
            company.name = data[iMain].name;
            company.source = 'linkedIn';
            result.push(company);
        }
    }
    return result;
}

function getPeopleLinks(data, ids) {
    var result = [];
    for (var iMain = 0; iMain < data.length; iMain++) {
        if (data[iMain].member && data[iMain].member.authToken && data[iMain].member.memberId) {
            var person = {};
            person.searchLink = 'https://www.linkedin.com/sales/profile/' + data[iMain].member.memberId + ',' + data[iMain].member.authToken + ',NAME_SEARCH';
            person.source_id = data[iMain].member.memberId;
            person.name = data[iMain].member.formattedName;
            person.source = 'linkedIn';
            result.push(person);
        }
    }
    return result;
}

function getCompaniesList_S(source) {
    var data = [];

    data = getDataFromPage_AS_S(source);

    void 0;

    if (!data || (data.length == 0)) {
        return undefined;
    }

    var linkedinMainInfoArray = [];
    linkedinMainInfoArray = getMasByKey_AS_S_2(data);

    if (linkedinMainInfoArray) {
        return getCompaniesLinks(linkedinMainInfoArray);
    }

}

function getPeopleList_S(source) {
    var data = [];

    data = getDataFromPage_AS_S(source);

    void 0;

    if (!data || (data.length == 0)) {
        return undefined;
    }

    var linkedinMainInfoArray = [];
    linkedinMainInfoArray = getMasByKey_AS_S(data);

    if (linkedinMainInfoArray) {
        return getPeopleLinks(linkedinMainInfoArray);
    }

}
