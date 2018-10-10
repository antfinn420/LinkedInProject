const MAIN_PROFILE_INFO = 'com.linkedin.voyager.identity.profile.Profile';
const USER_LOCATION = 'com.linkedin.voyager.common.NormBasicLocation';

const USER_SKILLS = 'com.linkedin.voyager.identity.profile.Skill';

const USER_COMPANIES = 'com.linkedin.voyager.entities.shared.MiniCompany';

const USER_POSITIONS = 'com.linkedin.voyager.identity.profile.Position';

const SEARCH_PROFILES_IDENT = 'com.linkedin.voyager.identity.shared.MiniProfile';

const USER_PROFILE_WEBSITE_IDENT = 'com.linkedin.voyager.identity.profile.ProfileWebsite';
const USER_PROFILE_WEBSITE_STANDART = 'com.linkedin.voyager.identity.profile.StandardWebsite';
const USER_TWITTER_IDENT = 'com.linkedin.voyager.identity.shared.TwitterHandle';
const USER_CONTACT_INFO = 'com.linkedin.voyager.identity.profile.ProfileContactInfo';
const USER_PHONE_NUMBER = 'com.linkedin.voyager.identity.profile.PhoneNumber';
const USER_IM = 'com.linkedin.voyager.identity.profile.IM';

const REG_JSON_BLOCKS_P = /<code.+?>([\s\S]+?)<\/code>/ig;
const REG_EMAILS = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;
const RegPageLang_P = /<meta\sname="i18nLocale"\scontent="(.*?)">/i;

function getDataFromPage_P(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS_P.exec(source)) {
        if (matches[1]) {
            var obj = {};
            try {
                obj = JSON.parse(matches[1].trim());
                if (obj && obj.data && obj.included && obj.included.length > 10) {
                    arData.push(obj);
                }
            } catch (e) {
            }
        }
    }
    return arData;
}

function getMasByKey_P(field, data, type, name) {
    for (key in data) {
        if ((key === field) && (data[key] === type) && (!name || (name && (name == (data.firstName + ' ' + data.lastName))))) {
            this.data = data;
            break;
        } else {
            if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                getMasByKey_P(field, data[key], type, name);
            }
        }
    }
    return this.data;
}

function getAll_P(field, data, type) {
    for (key in data) {
        if ((key === field) && (data[key] === type)) {
            this.data.push(data);
        } else {
            if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                getAll_P(field, data[key], type);
            }
        }
    }

    return this.data;
}

function searchEmails(input, emailsOld) {
    input = input.replace(/\s/ig, ' ');

    var emails = input.match(REG_EMAILS);

    if (emails && (emails.length > 0)) {
        for (var iNo = 0; iNo < emails.length; iNo++) {
            if (emailsOld.indexOf(emails[iNo]) == -1) {
                emailsOld.push(emails[iNo]);
            }
        }
    }

    return emailsOld;
}

function parseEmails(data, linkedinMainInfoArray) {
    var res = [];

    if (linkedinMainInfoArray.summary) {
        res = searchEmails(linkedinMainInfoArray.summary, res);
    }

    if (linkedinMainInfoArray.headline) {
        res = searchEmails(linkedinMainInfoArray.headline, res);
    }

    this.data = [];
    var companies = getAll_P('$type', data, USER_POSITIONS);
    for (key in companies) {
        if (companies[key].description) {
            res = searchEmails(companies[key].description, res);
        }
    }
    this.data = [];
    return res;
}

function parseContactInfo(data, linkedinMainInfoArray) {
    var res = {};

    res.e = parseEmails(data, linkedinMainInfoArray);


    return res;
}

function findDescr_P(source, reg) {
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


function getUserInfo(source, name) {
    var data = [];
    data = getDataFromPage_P(source);

    if (!data || (data.length == 0)) {
        return undefined;
    }

    var linkedinMainInfoArray;
    var linkedinPerson;

    function getLinkedinMainInfoArray(field, data, type, parent, name) {
        for (key in data) {
            if (!linkedinMainInfoArray && (key === field) && (data[key] === type) && (!name || (name && (name == (data.firstName + ' ' + data.lastName))))) {

                linkedinMainInfoArray = data;
                linkedinPerson = parent;
                return;
                break;
            } else {
                if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                    getLinkedinMainInfoArray(field, data[key], type, data, name);
                }
            }
        }
    }

    getLinkedinMainInfoArray('$type', data, MAIN_PROFILE_INFO, data.parent, name);

    if (!linkedinMainInfoArray || !linkedinMainInfoArray.firstName) {
        return undefined;
    }

    var user = {};
    user.source = 'linkedIn';

    user.fullInfo = 1;

    var pageLang = findDescr_P(source, RegPageLang_P);
    if (pageLang) {
        user.page_lang = pageLang.toLowerCase();
    }

    if (linkedinMainInfoArray.firstName) {
        user.firstName = linkedinMainInfoArray.firstName;
        user.name = linkedinMainInfoArray.firstName;
    }
    if (linkedinMainInfoArray.lastName) {
        user.lastName = linkedinMainInfoArray.lastName;
        user.name += ' ' + linkedinMainInfoArray.lastName;
    }
    if (linkedinMainInfoArray.industryName) {
        user.industry = linkedinMainInfoArray.industryName;
    }
    if (linkedinMainInfoArray.locationName) {
        user.locality = linkedinMainInfoArray.locationName;
    }

    if (linkedinMainInfoArray.entityUrn) {
        user.entityUrn = linkedinMainInfoArray.entityUrn.replace('urn:li:fs_profile:', '');
    }

    var location = getMasByKey_P('$type', data, USER_LOCATION);
    if (location.countryCode) {
        user.country = location.countryCode;
    }

    if (linkedinMainInfoArray.miniProfile) {
        var miniProfile = getMasByKey_P('entityUrn', data, linkedinMainInfoArray.miniProfile);

        if (miniProfile.publicIdentifier) {
            user.source_id_2 = miniProfile.publicIdentifier.trim();

            if (user.country) {
                user.source_page = 'https://' + user.country + '.linkedin.com/in/' + user.source_id_2 + '/';
            } else {
                user.source_page = 'https://www.linkedin.com/in/' + user.source_id_2 + '/';
            }
        }

        if (miniProfile.objectUrn) {
            user.source_id = miniProfile.objectUrn.replace('urn:li:member:', '');
        }
    }

    {
        this.data = [];
        var logos = getAll_P('$type', linkedinPerson, 'com.linkedin.voyager.identity.profile.Picture');
        void 0;
        void 0;
        if (logos && (logos.length > 0)) {
            var profileId = linkedinMainInfoArray.miniProfile.replace('urn:li:fs_miniProfile:', '');
            if (logos[0].$id.indexOf(profileId) !== -1) {
                if (logos[0].masterImage) {
                    user.logo = 'https://media.licdn.com/media' + logos[0].masterImage;
                } else if (logos[0].croppedImage) {
                    user.logo = 'https://media.licdn.com/media' + logos[0].croppedImage;
                }
            }
        }
    }

    if (!user.logo) {
        this.data = [];
        var urls = getAll_P('$id', linkedinPerson, linkedinMainInfoArray.miniProfile + ',picture,com.linkedin.common.VectorImage');
        if (urls) {
            void 0;
            for (key in urls) {
                if (urls[key].rootUrl && (urls[key].rootUrl.indexOf('profile-displayphoto-shrink') !== -1)) {
                    var rootUrl = urls[key].rootUrl;
                    break;
                }
            }
        }

        this.data = [];
        var logos = getAll_P('$type', linkedinPerson, 'com.linkedin.common.VectorArtifact');
        if (logos) {
            void 0;
            for (key in logos) {
                if (logos[key].height && logos[key].width && (logos[key].height == 800) && (logos[key].width == 800)
                    && logos[key].fileIdentifyingUrlPathSegment && logos[key].$id && (logos[key].$id.indexOf(linkedinMainInfoArray.miniProfile) == 0)) {
                    var resp = $('<textarea/>').html(logos[key].fileIdentifyingUrlPathSegment).text();
                    void 0;
                    if (rootUrl) {
                        user.logo = rootUrl + resp;
                    } else {
                        user.logo = resp;
                    }
                    break;
                }
            }
        }
    }

    this.data = [];
    var skills = getAll_P('$type', data, USER_SKILLS);
    if (skills) {
        user.skills = [];
        for (key in skills) {
            if (skills[key].name) {
                user.skills.push(skills[key].name);
            }
        }
    }

    this.data = [];

    user.current = [];
    user.previous = [];

    var companies = getAll_P('$type', data, USER_POSITIONS);

    for (company in companies) {
        if (companies[company].companyName) {
            var job = {};
            job.company_name = companies[company].companyName.trim();
            job.position = companies[company].title.trim();

            if (companies[company].companyUrn) {
                job.source_id = companies[company].companyUrn.replace('urn:li:fs_miniCompany:', '');
            }

            if (companies[company].timePeriod) {
                var timedPeriod = getMasByKey_P('$id', data, companies[company].timePeriod);

                if (timedPeriod) {
                    if (timedPeriod.$id) {
                        var position_id = findDescrByRegEx(timedPeriod.$id, /(\d+)\),timePeriod/i);
                        if (position_id) {
                            job.position_id = position_id;
                        }
                    } else {
                        void 0;
                    }

                    if (timedPeriod.startDate) {
                        var startBlock = getMasByKey_P('$id', data, timedPeriod.startDate);
                        if (startBlock && startBlock.year) {
                            var year = startBlock.year;
                            var month = 1;
                            if (startBlock.month) {
                                month = startBlock.month;
                            }
                            var startDate = new Date(year, month - 1, 1);
                            if (startDate > 1000) {
                                job.start = startDate / 1000;
                            }
                        }
                    }

                    if (timedPeriod.endDate) {
                        var endBlock = getMasByKey_P('$id', data, timedPeriod.endDate);
                        if (endBlock && endBlock.year) {
                            var year = endBlock.year;
                            var month = 1;
                            if (endBlock.month) {
                                month = endBlock.month;
                            }
                            var endDate = new Date(year, month - 1, 1);
                            if (endDate > 1000) {
                                job.end = endDate / 1000;
                            }
                        }

                        user.previous.push(job);
                    } else {
                        user.current.push(job);
                    }
                }
            } else {
                user.current.push(job);
            }
        }
    }
    if ((user.current.length > 0) && (user.previous.length > 0)) {
        for (var iCurrentNo = 0; iCurrentNo < user.current.length; iCurrentNo++) {
            if (!user.current[iCurrentNo].source_id) {
                for (var iPreviousNo = 0; iPreviousNo < user.previous.length; iPreviousNo++) {
                    if (user.current[iCurrentNo].company_name === user.previous[iPreviousNo].company_name) {
                        user.current[iCurrentNo].source_id = user.previous[iPreviousNo].source_id;
                        break;
                    }
                }
            }
        }
    }

    user.cInfo = parseContactInfo(data, linkedinMainInfoArray);

    return user;
}
