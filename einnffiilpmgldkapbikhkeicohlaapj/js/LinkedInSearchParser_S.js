const regSalesPersonName = /title="(.+?)" class="name-link profile-link">/i;
const regSalesPersonSearchLink = /<a href="(\/sales\/profile\/.+?)"/i;
const regSalesPersonLogo = /src="(.*?)"/i;
const regSalesPersonLocation = /class="location">(.*)<\/p>/i;
const regSalesPersonId = /member\sm(\d+)/i;
const regSalesSearchPersonBlock = /<li class="result loading member.*?">([\s\S]*?)<\/li>/gi;

const regSalesSearchPersonDescription = /<p class="info-value">([\s\S]*?)<\/p>/gi;
const regSalesSearchPersonDescriptionText = /<p class="info-value">([\s\S]*?)<\/p>/i;
const regSalesSearchPersonPosition = /class="company-name company-link" title="(.*?)"/i;
const regSalesSearchPersonPositionEmpty = /class="company-name" title="(.*?)"/i;
const regSalesSearchPersonPositionCompanyId = /\/sales\/accounts\/insights\?companyId=(\d+?)&/i;

const regSalesSearchCompanyBlock = /<li class="result loading company.*">([\s\S]*?)<\/div><\/li>/gi;
const regSalesSearchCompanyName = /title="(.*?)" class="name-link account-link"/i;
const regSalesSearchCompanyLogo = /src="(.+?)"/i;


function findDescr_S_S(source, reg) {
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

function getCompanies_S_S(source) {
    var companies = [];

    var search = source.match(regSalesSearchCompanyBlock);

    if (search) {
        for (var iNo = 0; iNo < search.length; iNo++) {
            var company = getCompaniesBlockInfo_S_S(search[iNo]);
            if (company) {
                companies.push(company);
            }
        }
    }

    return companies;
}


function getCompaniesBlockInfo_S_S(source) {
    var company = {};

    company.name = findDescr_S_S(source, regSalesSearchCompanyName);
    company.source_id = findDescr_S_S(source, regSalesSearchPersonPositionCompanyId);
    company.logo = findDescr_S_S(source, regSalesSearchCompanyLogo);

    return company;
}

function getPeople_S_S(source) {
    var people = [];

    var search = source.match(regSalesSearchPersonBlock);

    if (search) {
        for (var iNo = 0; iNo < search.length; iNo++) {
            var person = parseSalesProfilePersonalBlock(search[iNo]);
            if (person) {
                people.push(person);
            }
        }
    }

    return people;
}

function getCompanies_S_SP(source) {
    var companies = [];
    var regExp = /<code.*style="display: none".*>\s*([\s\S]*?)<\/code>/ig;
    while (matches = regExp.exec(source)) {
        if (matches[1]) {
            var txt = $('<textarea/>').html(matches[1]).text();
            try {
                var obj = JSON.parse(txt);
                if (obj.elements && obj.paging && obj.metadata && (companies.length == 0)) {
                    for (elem in obj.elements) {
                        var profile = obj.elements[elem];
                        var company = {};
                        company.source = 'linkedIn';

                        if (profile.companyName) {
                            company.name = profile.companyName;
                        }
                        if (profile.entityUrn) {
                            company.source_id = +findDescrByRegEx(profile.entityUrn, /:(\d+)/i);
                        }
                        if (profile.companyPictureDisplayImage && profile.companyPictureDisplayImage.artifacts) {
                            for (var iNo = 0; iNo < profile.companyPictureDisplayImage.artifacts.length; iNo++) {
                                if (profile.companyPictureDisplayImage.artifacts[iNo].width = 100) {
                                    company.logo = $('<textarea/>').html(profile.companyPictureDisplayImage.artifacts[iNo].fileIdentifyingUrlPathSegment).text();
                                    break;
                                }
                            }
                            if (!company.logo && (profile.companyPictureDisplayImage.artifacts && profile.profilePictureDisplayImage.artifacts.length > 0)) {
                                company.logo = $('<textarea/>').html(profile.companyPictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment).text();
                            }
                            if (company.logo && profile.companyPictureDisplayImage.rootUrl) {
                                company.logo = profile.companyPictureDisplayImage.rootUrl + company.logo;
                            }
                        }

                        companies.push(company);
                    }
                }

            } catch (e) {}
        }
    }
    return companies;
}

function getPeople_S_SP(source) {
    source = source.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
    var people = [];
    var regExp = /<code.*style="display: none".*>\s*([\s\S]*?)<\/code>/ig;
    void 0;

    while (matches = regExp.exec(source)) {
        if (matches[1]) {
            var txt = $('<textarea/>').html(matches[1]).text();
            try {
                var obj = JSON.parse(txt);
                if (obj.elements && obj.paging && obj.metadata && (people.length == 0)) {
                    for (elem in obj.elements) {
                        profile = obj.elements[elem];
                        var person = {};
                        person.source = 'linkedIn';

                        if (profile.firstName) {
                            person.firstName = $('<textarea/>').html(convertHtmlToText(profile.firstName)).text();
                        }
                        if (profile.lastName) {
                            person.lastName = $('<textarea/>').html(convertHtmlToText(profile.lastName)).text();
                        }
                        if (profile.fullName) {
                            person.name = $('<textarea/>').html(convertHtmlToText(profile.fullName)).text();
                        }
                        if (profile.objectUrn) {
                            person.source_id = +findDescrByRegEx(profile.objectUrn, /:(\d+)/i);
                        }

                        if (profile.entityUrn) {
                            person.searchLink = 'https://www.linkedin.com/sales/people/' + profile.entityUrn.replace('urn:li:fs_salesProfile:(', '').replace(')', '');
                        }

                        if (profile.profilePictureDisplayImage && profile.profilePictureDisplayImage.artifacts) {
                            for (var iNo = 0; iNo < profile.profilePictureDisplayImage.artifacts.length; iNo++) {
                                if (profile.profilePictureDisplayImage.artifacts[iNo].width = 100) {
                                    person.logo = $('<textarea/>').html(profile.profilePictureDisplayImage.artifacts[iNo].fileIdentifyingUrlPathSegment).text();
                                    break;
                                }
                            }
                            if (!person.logo && (profile.profilePictureDisplayImage.artifacts && profile.profilePictureDisplayImage.artifacts.length > 0)) {
                                person.logo = $('<textarea/>').html(profile.profilePictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment).text();
                            }
                            if (person.logo && profile.profilePictureDisplayImage.rootUrl) {
                                person.logo = profile.profilePictureDisplayImage.rootUrl + person.logo;
                            }
                        }

                        people.push(person);
                    }
                }
            } catch (e) {
                void 0;
                void 0;
            }
        }
    }

    return people;
}

function parseSalesProfilePersonalBlock(source) {
    var person = {};

    person.name = decodeURIComponent(findDescr_S_S(source, regSalesPersonName));
    if (!person.name || (person.name === 'LinkedIn Member')) {
        return undefined;
    }

    var arr = source.match(regSalesSearchPersonDescription);
    var arr2 = [];

    for (var i in arr) {
        var match = arr[i].match(regSalesSearchPersonDescriptionText);

        arr2.push(match[1].replace('<b>', '').replace('</b>', ''));
    }

    if (arr2) {
        person.locality = arr2[2];

        person.current = [];

        var companyName = findDescr_S_S(source, regSalesSearchPersonPosition);

        if (!companyName) {
            companyName = findDescr_S_S(source, regSalesSearchPersonPositionEmpty);
            person.current.push({
                company_name: companyName,
                position: arr2[0],

            });
        } else {
            person.current.push({
                company_name: companyName,
                position: arr2[0],
                source_id: findDescr_S_S(source, regSalesSearchPersonPositionCompanyId)
            });
        }

        person.previous = [];
    }

    var arrName = person.name.split(' ');
    if (arrName.length == 1) {
        person.firstName = arrName[0];
        person.lastName = null;
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

    var location = findDescr_S_S(source, regSalesPersonLocation);

    if (location) {
        var arrLocation = location.split(" \u2022 ");

        person.locality = arrLocation[0];
        person.industry = arrLocation[1];
    }

    person.logo = decodeURIComponent(findDescr_S_S(source, regSalesPersonLogo));
    if (person.logo && (person.logo.indexOf('http') == -1)) {
        person.logo = 'https://www.linkedin.com' + person.logo;
    }

    person.source = 'linkedIn';

    person.source_id = findDescr_S_S(source, regSalesPersonId);

    person.searchLink = findDescr_S_S(source, regSalesPersonSearchLink);

    return person;
}


function getCodeSize_S_S(size) {
    var code = '';
    size = size.replace(' employees');
    switch (size) {
        case '1-10':
            code = 'B';
            break;
        case '11-50':
            code = 'C';
            break;
        case '51-200':
            code = 'D';
            break;
        case '201-500':
            code = 'E';
            break;
        case '501-1000':
            ccode = 'F';
            break;
        case '1001-5000':
            code = 'G';
            break;
        case '5001-10,000':
            code = 'H';
            break;
        case '10,001+':
            code = 'I';
            break;

    }

    if (code === '') {
        var mas = size.split('-');

        if (mas.length === 2) {
            size = parseInt(mas[1].replace(',', '')) / parseInt(mas[0].replace(',', '').replace('+', ''));

            if ((size > 0) && (size < 11)) {
                code = 'B';
            } else
            if ((size > 10) && (size < 51)) {
                code = 'C';
            } else
            if ((size > 50) && (size < 201)) {
                code = 'D';
            } else
            if ((size > 200) && (size < 501)) {
                code = 'E';
            } else
            if ((size > 500) && (size < 1001)) {
                code = 'F';
            } else
            if ((size > 1000) && (size < 5001)) {
                code = 'G';
            } else
            if ((size > 5000) && (size < 10001)) {
                code = 'H';
            } else
            if (size > 10000) {
                code = 'I';
            } else
                code = 'A';
        } else {
            size = parseInt(mas[0].replace(',', '').replace('+', ''))
            if (size > 1000) {
                code = 'I';
            }
        }
    }

    return code;
}