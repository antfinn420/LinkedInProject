class ParserSN extends AutoSearchLI {

    constructor(task) {
        super(task);
        this.peopleCountOnPage = 25;
    }

    getCurrentSearchUrl(curSearchUrl) {
        if ((curSearchUrl.indexOf('sales/search/people') == -1)) {
            curSearchUrl = super.getCurrentSearchUrl(curSearchUrl);
            if (curSearchUrl.indexOf('sales/search/results') == -1) {
                curSearchUrl = curSearchUrl.replace(/sales\/search/ig, 'sales/search/results');
            }
        } else {
            if (curSearchUrl.indexOf('&page=') == -1) {
                curSearchUrl = curSearchUrl + '&page=' + this.pageCurrent;
            } else {
                curSearchUrl = curSearchUrl.replace(/&page=\d+/i, '&page=' + this.pageCurrent);
            }
        }

        return curSearchUrl;
    }

    getCompanyUrl(id) {
        return 'https://www.linkedin.com/sales-api/salesApiCompanies/' + id +
            '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';
    }

    getPeopleList(source) {
        var resp = [];
        if (source && source.searchResults && source.trackingInfoJson) {
            var res = source.searchResults;
            var info = source.trackingInfoJson;

            var result = [];
            for (var key in res) {
                if (res[key].member && res[key].member.memberId) {
                    var user = {};
                    user.source_id = res[key].member.memberId;
                    user.name = res[key].member.formattedName;
                    user.source = 'linkedIn';

                    if (res[key].member.authType && res[key].member.authToken && res[key].member.profileId && localStorage['csrfToken']) {
                        user.searchLink = 'https://www.linkedin.com/sales-api/salesApiProfiles/(';
                        user.searchLink += 'profileId:' + res[key].member.profileId + ',authType:NAME_SEARCH,authToken:' + res[key].member.authToken + ')';
                        user.searchLink += '?decoration=%28entityUrn%2CobjectUrn%2CpictureInfo%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cheadline%2CmemberBadges%2Cdegree%2CprofileUnlockInfo%2Clocation%2Cindustry%2CnumOfConnections%2CinmailRestriction%2CsavedLead%2CdefaultPosition%2CcontactInfo%2Csummary%2CcrmStatus%2CpendingInvitation%2Cunlocked%2CrelatedColleagueCompanyId%2CnumOfSharedConnections%2CshowTotalConnectionsPage%2CconnectedTime%2CnoteCount%2CmailboxThreadUrn%2CmessageSentCount%2CflagshipProfileUrl%2Cpositions*%2Ceducations*%2Ctags*~fs_salesTag%28entityUrn%2Ctype%2Cvalue%29%29';

                        $.ajaxSetup({
                            headers: {
                                'csrf-token': localStorage['csrfToken'],
                                'x-restli-protocol-version': '2.0.0'
                            },
                            global: false,
                            type: 'GET'
                        });
                    } else {
                        user.searchLink = 'https://www.linkedin.com/sales/profile/' +
                            res[key].member.memberId + ',' +
                            res[key].member.authToken + ',' +
                            res[key].member.authType;
                        if (info && info.moduleKey) {
                            user.searchLink += '&moduleKey=' + info.moduleKey;
                        }
                        if (info && info.pageKey) {
                            user.searchLink += '&pageKey=' + info.pageKey;
                        }
                        if (info && info.contextId) {
                            user.searchLink += '&contextId=' + info.contextId;
                        }
                        if (info && info.requestId) {
                            user.searchLink += '&requestId=' + info.requestId;
                        }
                    }

                    result.push(user);
                }
            }

            if (result) {
                resp = result;
            }
        }

        if (resp.length == 0) {
            return this.getPeopleList2(source);
        } else {
            return resp;
        }
    }

    getPeopleList2(source) {
        var people = [];
        var regExp = /<code.*style="display: none".*>\s*([\s\S]*?)<\/code>/ig;
        void 0;

        var matches;
        while (matches = regExp.exec(source)) {
            if (matches[1]) {
                var txt = $('<textarea/>').html(matches[1]).text();
                try {
                    var obj = JSON.parse(txt);
                    if (obj.elements && obj.paging && obj.metadata && (people.length == 0)) {
                        for (var elem in obj.elements) {
                            var profile = obj.elements[elem];
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
                } catch (e) {}
            }
        }

        return people;
    }

    getSearchLink(link) {
        var fnd = link.match(/sales\/people\/(.+?),(.+?),(.+?)(\?|$)|profile\/(.+?),(.+?),(.+?)(\?|$)/i);
        if (fnd && fnd.length > 3) {
            for (var iNo = 1; iNo < 4; iNo++) {
                if (fnd[iNo].length < 11) {
                    var authToken = fnd[iNo];
                }
                if (fnd[iNo].length > 11) {
                    var profileId = fnd[iNo];
                }
            }
            if (profileId && authToken) {
                var profileLink = 'https://www.linkedin.com/sales-api/salesApiProfiles/(';
                profileLink += 'profileId:' + profileId + ',authType:NAME_SEARCH,authToken:' + authToken + ')';
                profileLink += '?decoration=%28entityUrn%2CobjectUrn%2CpictureInfo%2CprofilePictureDisplayImage%2CfirstName%2ClastName%2CfullName%2Cheadline%2CmemberBadges%2Cdegree%2CprofileUnlockInfo%2Clocation%2Cindustry%2CnumOfConnections%2CinmailRestriction%2CsavedLead%2CdefaultPosition%2CcontactInfo%2Csummary%2CcrmStatus%2CpendingInvitation%2Cunlocked%2CrelatedColleagueCompanyId%2CnumOfSharedConnections%2CshowTotalConnectionsPage%2CconnectedTime%2CnoteCount%2CmailboxThreadUrn%2CmessageSentCount%2CflagshipProfileUrl%2Cpositions*%2Ceducations*%2Ctags*~fs_salesTag%28entityUrn%2Ctype%2Cvalue%29%29';
            }
        }

        if (profileLink) {
            return profileLink;
        } else {
            return link;
        }
    }

    getUserInfo(source) {
        var profile = source;
        if (profile) {
            var user = {};
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


        } else {
            return undefined;
        }

        return user;
    }

    getCompanyInfo(source) {
        var profile = source;
        if (profile) {
            var res = {};

            res.source = 'linkedIn';

            res.name = profile.name;


            if (profile.entityUrn) {
                res.source_id = profile.entityUrn.replace('urn:li:fs_salesCompany:', '');
                if (res.source_id) {
                    res.source_page = 'https://www.linkedin.com/company/' + res.source_id;
                }
            }

            if (profile.location) {
                res.locality = profile.location;
            }

            if (profile.headquarters) {
                if (profile.headquarters.country) {
                    res.country = profile.headquarters.country;
                }
                if (profile.headquarters.city) {
                    res.city = profile.headquarters.city;
                }
                if (profile.headquarters.geographicArea) {
                    res.state = profile.headquarters.geographicArea;
                }
                if (profile.headquarters.line1) {
                    res.street = profile.headquarters.line1;
                }
                if (profile.headquarters.line2) {
                    res.street2 = profile.headquarters.line2;
                }
                if (profile.headquarters.postalCode) {
                    res.postal = profile.headquarters.postalCode;
                }
            }

            if (profile.website) {
                res.url = profile.website;
            }

            if (profile.companyPictureDisplayImage && profile.companyPictureDisplayImage.artifacts) {
                for (var iNo = 0; iNo < profile.companyPictureDisplayImage.artifacts.length; iNo++) {
                    if (profile.companyPictureDisplayImage.artifacts[iNo].width = 100) {
                        res.logo = $('<textarea/>').html(profile.companyPictureDisplayImage.artifacts[iNo].fileIdentifyingUrlPathSegment).text();
                        break;
                    }
                }
                if (!res.logo && (profile.companyPictureDisplayImage.artifacts && profile.companyPictureDisplayImage.artifacts.length > 0)) {
                    res.logo = $('<textarea/>').html(profile.companyPictureDisplayImage.artifacts[0].fileIdentifyingUrlPathSegment).text();
                }
                if (profile.companyPictureDisplayImage.rootUrl) {
                    res.logo = profile.companyPictureDisplayImage.rootUrl + res.logo;
                }
            } else {
                if (profile.pictureInfo && profile.pictureInfo.logo) {
                    res.logo = 'https://media.licdn.com/mpr/mpr/shrink_100_100' + profile.pictureInfo.logo;
                }
            }

            if (profile.industry) {
                res.industry = profile.industry;
            }

            if (profile.foundingYear) {
                res.founded = profile.foundingYear;
            }

            if (profile.employeeCountRange) {
                res.size = getCodeSize(profile.employeeCountRange);
            }

            return res;
        } else {
            return undefined;
        }
    }
}