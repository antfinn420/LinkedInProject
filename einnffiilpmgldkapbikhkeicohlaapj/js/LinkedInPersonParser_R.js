const REG_JSON_BLOCKS_P_R = /<code.+?><!--([\s\S]+?)--><\/code>/ig;
const REG_EMAILS_P_R = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;

function getDataFromPage_P_R(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS_P_R.exec(source)) {
        if (matches[1]) {
            var obj = {};
            try {
                var resp = matches[1].trim();
                obj = JSON.parse(resp);
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
                }
            }
        }
    }
    return arData;
}

function searchEmails_P_R(input, emailsOld) {
    input = input.replace(/\s/ig, ' ');

    var emails = input.match(REG_EMAILS_P_R);

    if (emails && (emails.length > 0)) {
        for (var iNo = 0; iNo < emails.length; iNo++) {
            if (emailsOld.indexOf(emails[iNo]) == -1) {
                emailsOld.push(emails[iNo]);
            }
        }
    }

    return emailsOld;
}

function parseEmails_P_R(data) {
    var res = [];

    var profile = data[1].data.profile;


    if (profile.summary) {
        res = searchEmails_P_R(profile.summary, res);
    }

    if (profile.headline) {
        res = searchEmails_P_R(profile.headline, res);
    }

    var positions = data[1].data.positions;

    for (var i in positions) {
        var position = positions[i].position;

        res = searchEmails_P_R(position.displayText, res);
        if (position.summary) {
            res = searchEmails_P_R(position.summary, res);
        }

        res = searchEmails_P_R(position.title, res);
    }

    return res;
}

function parseContactInfo_P_R(data) {
    var res = {};

    res.e = parseEmails_P_R(data);


    return res;
}

function getUserInfo_P_R(source) {
    var data = getDataFromPage_P_R(source);



    if (!data || (data.length == 0)) {
        return undefined;
    }

    var user = {};


    if (data[1] && data[1].data && data[1].data.profile) {
        var profile = data[1].data.profile;
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

        if (pageData) {
            user.page_lang = pageData.locale.toLowerCase();
        }

        if (profile.memberId) {
            user.source_id = profile.memberId;
        }

        if (profile.publicLink) {
            user.source_page = profile.publicLink;
        }

        if (profile.publicLink) {
            var res = profile.publicLink.match(/in\/(.+)|in\/(.+)\//i);
            if (res) {
                if (res[1]) {
                    user.source_id_2 = res[1];
                } else {
                    if (res[2]) {
                        user.source_id_2 = res[2];
                    }
                }
            }
        }
        if (!user.source_id_2) {
            void 0;
        }

        if (profile.imageUri) {
            user.logo = profile.imageUri.replace('shrink_xx_yy', 'shrink_400_400');
        }

        var current = [];
        var previous = [];
        var profilePositions = data[1].data.positions;

        if (profilePositions) {
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
                if (objPosition.i18nStartDate) {
                    var year = objPosition.startDateYear;
                    var month = 1;
                    if (objPosition.startDateMonth) {
                        month = objPosition.startDateMonth;
                    }
                    var startDate = new Date(year, month - 1, 1);
                    if (startDate > 1000) {
                        newPosition.start = startDate / 1000;
                    }
                }
                if (objPosition.i18nEndDate) {
                    var year = objPosition.endDateYear;
                    var month = 1;
                    if (objPosition.endDateMonth) {
                        month = objPosition.endDateMonth;
                    }
                    var endDate = new Date(year, month - 1, 1);
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

        user.current = current;
        user.previous = previous;

        user.cInfo = parseContactInfo_P_R(data);

    } else {
        return undefined;
    }

    return user;
}