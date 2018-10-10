function getPeopleList_S2(source) {
    if (source && source.searchResults && source.trackingInfoJson) {
        var res = source.searchResults;
        var info = source.trackingInfoJson;

        var result = [];
        for (key in res) {
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

        return result;
    }
}

function getTrackingInfo(source) {
    if (source && source.trackingInfoJson) {
        return source.trackingInfoJson;
    }
}

function getCompaniesList_S2(source) {
    if (source && source.searchResults && source.trackingInfoJson) {
        var res = source.searchResults;
        var info = source.trackingInfoJson;

        var result = [];
        for (key in res) {
            if (res[key].name && res[key].companyId) {
                var company = {};
                company.source_id = res[key].companyId;
                company.name = res[key].name;
                company.source = 'linkedIn';

                if (localStorage['csrfToken']) {
                    company.searchLink = 'https://www.linkedin.com/sales-api/salesApiCompanies/' + res[key].companyId;
                    company.searchLink += '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';
                } else {
                    company.searchLink = 'https://www.linkedin.com/sales/accounts/insights?companyId=' + res[key].companyId;
                    if (info && info.moduleKey) {
                        company.searchLink += '&moduleKey=' + info.moduleKey;
                    }
                    if (info && info.pageKey) {
                        company.searchLink += '&pageKey=' + info.pageKey;
                    }
                    if (info && info.contextId) {
                        company.searchLink += '&contextId=' + info.contextId;
                    }
                }

                result.push(company);
            }
        }

        return result;
    }
}