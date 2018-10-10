const REG_JSON_BLOCKS2_P_S = /<code.+?><!--([\s\S]+?)--><\/code>/ig;
const REG_EMAILS_P_S = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;

var dataMain;


function getDataFromPage_P_S(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS2_P_S.exec(source)) {
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

function searchEmails_P_S(input, emailsOld) {
    input = input.replace(/\s/ig, ' ');

    var emails = input.match(REG_EMAILS_P_S);

    if ((emails !== null) && (emails.length > 0)) {
        for (var iNo = 0; iNo < emails.length; iNo++) {
            if (emailsOld.indexOf(emails[iNo]) == -1) {
                emailsOld.push(emails[iNo]);
            }
        }
    }

    return emailsOld;
}

function parseEmails_P_S(data) {
    var res = [];

    if (!dataMain || !dataMain.profile) {
        return res;
    }

    var profile = dataMain.profile;


    if (profile.summary) {
        res = searchEmails_P_S(profile.summary, res);
    }

    if (profile.headline) {
        res = searchEmails_P_S(profile.headline, res);
    }

    var positions = profile.positions;

    for (var i in positions) {
        var position = positions[i];

        if (position.summary) {
            res = searchEmails_P_S(position.summary, res);
        }

        res = searchEmails_P_S(position.title, res);
    }

    return res;
}

function parseContactInfo_P_S(data) {
    var res = {};

    res.e = parseEmails_P_S(data);


    return res;
}

function getUserInfo_P_S(source) {
    var data = getDataFromPage_P_S(source);

    if (!data || (data.length == 0)) {
        return undefined;
    }

    var user = {};


    if (data[1] && data[1].profile) {
        dataMain = data[1];
    } else {
        if (data[3] && data[3].profile) {
            dataMain = data[3];
        }
    }


    if (dataMain && dataMain.profile) {
        var profile = dataMain.profile;
        var pageData = data[0];

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

        if (pageData && pageData.locale) {
            user.page_lang = pageData.locale.toLowerCase();
        }

        if (profile.memberId) {
            user.source_id = profile.memberId;
        }

        if (profile.publicLink) {
            user.source_page = profile.publicLink;
        }

        if (profile.publicLink) {
            user.source_id_2 = null;
        }

        if (profile.vectorImage) {
            if (profile.vectorImage.rootUrl) {
                if (profile.vectorImage.artifacts) {
                    for(var iNo = 0; iNo < profile.vectorImage.artifacts.length; iNo++) {
                        if (profile.vectorImage.artifacts[iNo].width = 200) {
                            user.logo = profile.vectorImage.rootUrl + profile.vectorImage.artifacts[iNo].fileIdentifyingUrlPathSegment;
                            break;
                        }
                    }
                    if (!user.logo && (profile.vectorImage.artifacts && profile.vectorImage.artifacts.length > 0)) {
                        user.logo = profile.vectorImage.rootUrl + profile.vectorImage.artifacts[0].fileIdentifyingUrlPathSegment;
                    }
                }
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
                if (objPosition.companyId) {
                    newPosition.source_id = objPosition.companyId;
                }
                if (objPosition.positionId) {
                    newPosition.position_id = objPosition.positionId
                } else {
                    void 0;
                }
                if (objPosition.formattedStartMonthYear) {
                    var startDate = Date.parse(objPosition.formattedStartMonthYear);
                    if (startDate > 1000) {
                        newPosition.start = startDate / 1000;
                    }

                }
                if (objPosition.formattedEndMonthYear) {
                    var endDate = Date.parse(objPosition.formattedEndMonthYear);
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

        user.cInfo = parseContactInfo_P_S(data);

    } else {
        return undefined;
    }

    return user;
}