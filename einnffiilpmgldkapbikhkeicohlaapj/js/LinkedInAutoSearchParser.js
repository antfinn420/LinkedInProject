const REG_JSON_BLOCKS_AS = /<code.+?>([\s\S]+?)<\/code>/ig;

function getDataFromPage_AS(source) {
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
            }
        }
    }
    return arData;
}

function getAll_AS(field, data, type) {
    for (key in data) {
        if ((key === field) && (data[key] === type)) {
            this.data.push(data);
        } else {
            if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                getAll_AS(field, data[key], type);
            }
        }
    }

    return this.data;
}

function getMasByKey_AS(data) {
    for (var iMain = 0; iMain < data.length; iMain++) {
        if (data[iMain].data && data[iMain].included) {
            if (data[iMain].data.metadata && data[iMain].data.metadata.origin && (data[iMain].data.metadata.origin.indexOf('SEARCH') > 0)) {
                return data[iMain].included;
            }
        }
    }
}

function getPeopleLinks(data, ids) {
    var result = [];
    for (var iMain = 0; iMain < data.length; iMain++) {
        if (data[iMain].entityUrn && (data[iMain].entityUrn.indexOf('urn:li:fs_miniProfile:') == 0)) {
            if (ids.indexOf(data[iMain].entityUrn.replace('urn:li:fs_miniProfile:', '')) !== -1) {
                var person = {};
                person.firstName = data[iMain].firstName;
                person.lastName = data[iMain].lastName;
                person.name = data[iMain].firstName + ' ' + data[iMain].lastName;
                person.source_id_2 = data[iMain].publicIdentifier;
                person.source = 'linkedIn';
                void 0;
                result.push(person);
            }
        }
    }
    void 0;
    return result;
}

function getPeopleList(source) {
    var data = [];

    data = getDataFromPage_AS(source);

    if (!data || (data.length == 0)) {
        return undefined;
    }

    var linkedinMainInfoArray = [];
    linkedinMainInfoArray = getMasByKey_AS(data);

    this.data = [];
    var temp = getAll_AS('$type', linkedinMainInfoArray, 'com.linkedin.voyager.identity.profile.MemberBadges');

    if (!temp || (temp.length == 0)) {
        return undefined;
    }

    var ids = [];
    for (var iNo = 0; iNo < temp.length; iNo++) {
        if (temp[iNo].entityUrn) {
            ids.push(temp[iNo].entityUrn.replace('urn:li:fs_memberBadges:', ''));
        }
    }

    if (linkedinMainInfoArray) {
        return getPeopleLinks(linkedinMainInfoArray, ids);
    }

}
