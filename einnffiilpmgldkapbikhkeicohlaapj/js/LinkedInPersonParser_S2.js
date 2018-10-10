const REG_JSON_BLOCKS2_P_S2 = /<code.+?>([\s\S]+?)<\/code>/ig;
const REG_EMAILS_P_S2 = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;
const REG_DETECT_LANG = /<meta name="i18nLocale" content="(.+)"/i;

var dataMain;


function getDataFromPage_P_S2(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS2_P_S2.exec(source)) {
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
                            void 0;
                            void 0;
                        }
                    }
                }
            }
        }
    }
    return arData;
}

function searchEmails_P_S2(input, emailsOld) {
    input = input.replace(/\s/ig, ' ');

    var emails = input.match(REG_EMAILS_P_S2);

    if ((emails !== null) && (emails.length > 0)) {
        for (var iNo = 0; iNo < emails.length; iNo++) {
            if (emailsOld.indexOf(emails[iNo]) == -1) {
                emailsOld.push(emails[iNo]);
            }
        }
    }

    return emailsOld;
}

function parseEmails_P_S2(profile) {
    var res = [];

    if (profile.summary) {
        res = searchEmails_P_S2(profile.summary, res);
    }

    if (profile.headline) {
        res = searchEmails_P_S2(profile.headline, res);
    }

    var positions = profile.positions;

    for (var i in positions) {
        var position = positions[i];

        if (position.description) {
            res = searchEmails_P_S2(position.description, res);
        }

        res = searchEmails_P_S2(position.title, res);
    }

    return res;
}

function parseContactInfo_P_S2(data) {
    var res = {};

    res.e = parseEmails_P_S2(data);

    if (!res.e) {
        return res;
    }
}

function getUserInfo_P_S2(source) {
    if (source.firstName) {
        var profile = source;
    } else {

        var data = getDataFromPage_P_S2(source);

        if (!data || (data.length == 0)) {
            return undefined;
        }


        for (var iNo = 0; iNo < data.length; iNo++) {
            if (data[iNo] && data[iNo].firstName && data[iNo].lastName) {
                var profile = data[iNo];
                break;
            }
        }
    }
    var user = {};

    if (profile) {
        user.source = 'linkedIn';

        user.fullInfo = 1;

        if (profile.firstName) {
            user.firstName = profile.firstName;
            if (!profile.fullName) {
                user.name = profile.firstName;
            }
        }
        if (profile.lastName) {
            user.lastName = profile.lastName;
            if (!profile.fullName) {
                user.name += ' ' + profile.lastName;
            }
        }

        if (profile.fullName) {
            user.name = profile.fullName;
        }

        if (profile.industry) {
            user.industry = profile.industry;
        }

        if (profile.location) {
            user.locality = profile.location;
        }

        if (profile.skills) {
            user.skills = profile.skills;
        }

        if (profile.objectUrn) {
            user.source_id = +findDescrByRegEx(profile.objectUrn, /:(\d+)/i);
        }

        if (profile.flagshipProfileUrl) {
            user.source_page = profile.flagshipProfileUrl;
        }
        if (profile.flagshipProfileUrl) {
            user.source_id_2 = findDescrByRegEx(profile.flagshipProfileUrl, /in\/(.+)$|in\/(.+)\//i);
        }

        if (profile.profilePictureDisplayImage && profile.profilePictureDisplayImage.artifacts) {
            for (var iNo = 0; iNo < profile.profilePictureDisplayImage.artifacts.length; iNo++) {
                if (profile.profilePictureDisplayImage.artifacts[iNo].width = 100) {
                    user.logo = $('<textarea/>').html(profile.profilePictureDisplayImage.artifacts[iNo].fileIdentifyingUrlPathSegment).text();
                    break;
                }
            }
            if (!user.logo && (profile.profilePictureDisplayImage.artifacts && profile.profilePictureDisplayImage.artifacts.length > 0)) {
                user.logo = $('<textarea/>').html(profile.profilePictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment).text();
            }
        }

        var current = [];
        var previous = [];

        if (profile.positions) {
            for (var position in profile.positions) {
                var objPosition = profile.positions[position];
                var newPosition = {};

                newPosition.company_name = objPosition.companyName;
                newPosition.position = objPosition.title;

                if (objPosition.companyUrn) {
                    newPosition.source_id = +findDescrByRegEx(objPosition.companyUrn, /:(\d+)/i);
                }
                if (objPosition.posId) {
                    newPosition.position_id = objPosition.posId
                } else {
                    void 0;
                }
                if (objPosition.startedOn) {
                    var startDate = new Date(objPosition.startedOn.year, objPosition.startedOn.month);
                    if (startDate > 1000) {
                        newPosition.start = startDate / 1000;
                    }

                }
                if (objPosition.endedOn) {
                    var endDate = new Date(objPosition.endedOn.year, objPosition.endedOn.month);
                    if (endDate > 1000) {
                        newPosition.end = endDate / 1000;
                    }
                }

                if (objPosition.current) {
                    current.push(newPosition);
                } else {
                    previous.push(newPosition);
                }
            }

            if ((current.length > 0) && (previous.length > 0)) {
                for (var iCurrentNo = 0; iCurrentNo < current.length; iCurrentNo++) {
                    if (!current[iCurrentNo].source_id) {
                        for (var iPreviousNo = 0; iPreviousNo < previous.length; iPreviousNo++) {
                            if (current[iCurrentNo].company_name === previous[iPreviousNo].company_name) {
                                current[iCurrentNo].source_id = previous[iPreviousNo].source_id;
                                break;
                            }
                        }
                    }
                }
            }
        }

        user.current = current;
        user.previous = previous;

        if (profile.defaultPosition) {
            user.defaultPosition = {};
            user.defaultPosition.company_name = profile.defaultPosition.companyName;
            user.defaultPosition.position = profile.defaultPosition.title;
            if (profile.defaultPosition.posId) {
                user.defaultPosition.position_id = profile.defaultPosition.posId;
            }

            if (profile.defaultPosition.companyUrn) {
                user.defaultPosition.source_id = +findDescrByRegEx(profile.defaultPosition.companyUrn, /:(\d+)/i);
            }

            if (profile.defaultPosition.startedOn) {
                var startDate = new Date(profile.defaultPosition.startedOn.year, profile.defaultPosition.startedOn.month);
                if (startDate > 1000) {
                    user.defaultPosition.start = startDate / 1000;
                }

            }
            if (profile.defaultPosition.endedOn) {
                var endDate = new Date(profile.defaultPosition.endedOn.year, profile.defaultPosition.endedOn.month);
                if (endDate > 1000) {
                    user.defaultPosition.end = endDate / 1000;
                }
            }

        }

        if (data) {
            var cInfo = parseContactInfo_P_S2(data);
            if (cInfo) {
                user.cInfo = cInfo;
            }
            user.page_lang = findDescrByRegEx(source, REG_DETECT_LANG);
        }


    } else {
        return undefined;
    }

    return user;
}