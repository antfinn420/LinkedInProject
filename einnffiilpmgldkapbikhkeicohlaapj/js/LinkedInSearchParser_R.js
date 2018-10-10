const regRecruiterPersonName = /class="search-result-profile-link" title=".*?">(.+?)<\/a>/i;
const regRecruiterPersonLink = /<a href="(.+?) class="search-result-profile-link" title=/i;
const regRecruiterPersonLogo = /<img src="(.*?)"/i;
const regRecruiterPersonLocation = /class="location">(.*)<\/p>/i;
const regRecruiterPersonId = /<a href="\/recruiter\/profile\/(\d+?),(.+)"/i;
const regRecruiterSearchPersonBlock = /<li tabindex="0" id="search-result-\d+?" class="search-result\s*?.*?">([\s\S]*?)<\/div><\/div>\s*<\/li>/gi;
const regRecruiterSearchPersonCurrentPosition = /<dd class="row-content curr-positions">([\s\S]*?)<\/dd>/i;
const regRecruiterSearchPersonPastPosition = /<dd class="row-content past-positions">([\s\S]*?)<\/dd>/i;
const regRecruiterSearchPersonGetItemPosition = /<li data-index="(\d+)">([\s\S]*?)<\/li>/gi;
const regRecruiterSearchPersonGetItemTextPosition = /<li data-index="(\d+)">([\s\S]*?)<span class="date-range"/i;

function findDescr_S_R(source, reg) {
    var sTemp = '';
    var fnd = source.match(reg);

    if ((fnd) && (fnd.length > 1)) {
        sTemp = fnd[1];
        sTemp = sTemp.trim();
        sTemp = convertHtmlToText(sTemp);
        return sTemp;
    } else {
        return '';
    }
}

function getPeople_S_R(source) {
    var people = [];

    var search = source.match(regRecruiterSearchPersonBlock);

    if (search) {
        for (var iNo = 0; iNo < search.length; iNo++) {
            var person = parseRecruiterProfilePersonalBlock(search[iNo]);
            if (person) {
                people.push(person);
            }
        }
    }

    return people;
}

function recruiterCompanies(source) {
    var arr = findDescr_S_R(source, regRecruiterSearchPersonPastPosition).match(regRecruiterSearchPersonGetItemPosition);

    var previous = [];

    for (var i in arr) {
        var res = arr[i].match(regRecruiterSearchPersonGetItemTextPosition);
        if (res && res[0] && res[1] && res[2]) {
            var namePosition = res[2].split(' at ');
            previous.push({
                company_name: namePosition[1],
                position: namePosition[0]
            });
        }
    }

    arr = findDescr_S_R(source, regRecruiterSearchPersonCurrentPosition).match(regRecruiterSearchPersonGetItemPosition);

    var current = [];

    for (var i in arr) {
        var res = arr[i].match(regRecruiterSearchPersonGetItemTextPosition);
        if (res && res[0] && res[1] && res[2]) {
            var namePosition = res[2].split(' at ');
            current.push({
                company_name: namePosition[1],
                position: namePosition[0]
            });
        }
    }

    return { current: current, previous: previous };
}

function parseRecruiterProfilePersonalBlock(source) {
    var person = {};

    person.name = decodeURIComponent(findDescr_S_R(source, regRecruiterPersonName));
    var arrName = person.name.split(' ');
    if (arrName.length == 1) {
        person.firstName = arrName[0];
        person.lastName = '';
    } else if (arrName.length == 2) {
        person.firstName = arrName[0];
        person.lastName = arrName[1];
    } else if (arrName.length > 2) {
        person.firstName = arrName[0];
        person.lastName = arrName[1];
        for (var i = 2; i < arrName.length; i++) {
            person.lastName += (' ' + arrName[i]);
        }
    }

    person.searchLink = decodeURIComponent(findDescr_S_R(source, regRecruiterPersonLink));

    var location = findDescr_S_R(source, regRecruiterPersonLocation);

    if (location) {
        var arrLocation = location.split(" \u2022 ");

        person.locality = arrLocation[0];
        person.industry = arrLocation[1];
    }

    person.logo = decodeURIComponent(findDescr_S_R(source, regRecruiterPersonLogo)).replace('shrink_100_100', 'shrink_400_400');

    person.source = 'linkedIn';

    person.source_id = findDescr_S_R(source, regRecruiterPersonId);

    var positions = recruiterCompanies(source);

    person.current = positions.current;
    person.previous = positions.previous;

    return person;
}