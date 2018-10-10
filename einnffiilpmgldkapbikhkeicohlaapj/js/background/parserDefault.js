class ParserDefault extends AutoSearchLI {

    constructor(task) {
        super(task);

        this.peopleCountOnPage = 10;
    }

    getCurrentSearchUrl(curSearchUrl) {
        if (curSearchUrl.indexOf('&page=') == -1) {
            curSearchUrl = curSearchUrl + '&page=' + this.pageCurrent;
        } else {
            curSearchUrl = curSearchUrl.replace(/&page=\d+/i, '&page=' + this.pageCurrent);
        }
        return curSearchUrl;
    }

    getCompanyUrl(id) {
        return 'https://www.linkedin.com/company/' + id + '/';
    }

    getSearchLink(link) {
        if (link.indexOf('.linkedin.com') == -1) {
            link = 'https://www.linkedin.com' + link;
        }
        return link;
    }

    getPeopleList(source) {
        var resp = [];
        var data__ = [];

        function getDataFromPage(source) {
            var arData = [];
            var matches;
            var reg = /<code.+?>([\s\S]+?)<\/code>/ig;
            while (matches = reg.exec(source)) {
                if (matches[1]) {
                    var obj = {};
                    try {
                        obj = JSON.parse(matches[1].trim());
                        if (obj) {
                            arData.push(obj);
                        }
                    } catch (e) {
                        void 0;
                        void 0;
                    }
                }
            }
            return arData;
        }

        function getAll(field, data, type) {
            for (var key in data) {
                if ((key === field) && (data[key] === type)) {
                    data_.push(data);
                } else {
                    if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                        getAll(field, data[key], type);
                    }
                }
            }

            return data_;
        }

        function getMasByKey(data) {
            for (var iMain = 0; iMain < data.length; iMain++) {
                if (data[iMain].data && data[iMain].included) {
                    if (data[iMain].data.metadata && data[iMain].data.metadata.origin &&
                        ((data[iMain].data.metadata.origin.indexOf('SEARCH') !== -1) ||
                            (data[iMain].data.metadata.origin.indexOf('HISTORY') !== -1 ||
                                (data[iMain].data.metadata.origin.indexOf('OTHER') !== -1)))) {
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
                        person.searchLink = 'https://www.linkedin.com/in/' + person.source_id_2 + '/';
                        void 0;
                        result.push(person);
                    }
                }
            }
            void 0;
            return result;
        }

        source = source.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');

        var data = [];
        data = getDataFromPage(source);

        if (!data || (data.length == 0)) {
            return [];
        }

        var linkedinMainInfoArray = [];
        linkedinMainInfoArray = getMasByKey(data);

        var data_ = [];
        var temp = getAll('$type', linkedinMainInfoArray, 'com.linkedin.voyager.identity.profile.MemberBadges');

        if (!temp || (temp.length == 0)) {
            return [];
        }

        var ids = [];
        for (var iNo = 0; iNo < temp.length; iNo++) {
            if (temp[iNo].entityUrn) {
                ids.push(temp[iNo].entityUrn.replace('urn:li:fs_memberBadges:', ''));
            }
        }

        if (linkedinMainInfoArray) {
            resp = getPeopleLinks(linkedinMainInfoArray, ids);
            if (!resp) {
                resp = [];
            }
        }

        return resp;
    }

    getUserInfo(source) {
        var data__ = [];

        function getDataFromPage(source) {
            var arData = [];
            var matches;
            var reg = /<code.+?>([\s\S]+?)<\/code>/ig;
            while (matches = reg.exec(source)) {
                if (matches[1]) {
                    var obj = {};
                    try {
                        obj = JSON.parse(matches[1].trim());
                        if (obj && obj.data && obj.included && obj.included.length > 10) {
                            arData.push(obj);
                        }
                    } catch (e) {
                        void 0;
                        void 0;
                    }
                }
            }
            return arData;
        }

        function getLinkedinMainInfoArray(field, data, type, parent) {
            for (var key in data) {
                if (!linkedinMainInfoArray && (key === field) && (data[key] === type)) {

                    linkedinMainInfoArray = data;
                    linkedinPerson = parent;
                    return;
                    break;
                } else {
                    if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                        getLinkedinMainInfoArray(field, data[key], type, data);
                    }
                }
            }
        }

        function getMasByKey(field, data, type, name) {
            for (var key in data) {
                if ((key === field) && (data[key] === type) && (!name || (name && (name == (data.firstName + ' ' + data.lastName))))) {
                    data__ = data;
                    break;
                } else {
                    if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                        getMasByKey(field, data[key], type, name);
                    }
                }
            }
            return data__;
        }

        function getAll(field, data, type) {
            for (var key in data) {
                if ((key === field) && (data[key] === type)) {
                    data_.push(data);
                } else {
                    if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                        getAll(field, data[key], type);
                    }
                }
            }

            return data_;
        }

        function parseContactInfo(data, linkedinMainInfoArray) {
            var res = {};

            res.e = parseEmails(data, linkedinMainInfoArray);
            return res;
        }

        function parseEmails(data, linkedinMainInfoArray) {
            var res = [];

            if (linkedinMainInfoArray.summary) {
                res = searchEmails(linkedinMainInfoArray.summary, res);
            }

            if (linkedinMainInfoArray.headline) {
                res = searchEmails(linkedinMainInfoArray.headline, res);
            }

            var data_ = [];
            var companies = getAll('$type', data, 'com.linkedin.voyager.identity.profile.Position');
            for (var key in companies) {
                if (companies[key].description) {
                    res = searchEmails(companies[key].description, res);
                }
            }
            data_ = [];
            return res;
        }

        function searchEmails(input, emailsOld) {
            input = input.replace(/\s/ig, ' ');

            var emails = input.match(/\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi);

            if (emails && (emails.length > 0)) {
                for (var iNo = 0; iNo < emails.length; iNo++) {
                    if (emailsOld.indexOf(emails[iNo]) == -1) {
                        emailsOld.push(emails[iNo]);
                    }
                }
            }

            return emailsOld;
        }

        source = source.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');

        var data = [];
        data = getDataFromPage(source);

        if (!data || (data.length == 0)) {
            return undefined;
        }

        var linkedinMainInfoArray;
        var linkedinPerson;

        getLinkedinMainInfoArray('$type', data, 'com.linkedin.voyager.identity.profile.Profile', data.parent);

        if (!linkedinMainInfoArray || !linkedinMainInfoArray.firstName) {
            return undefined;
        }

        var user = {};
        user.source = 'linkedIn';

        user.fullInfo = 1;

        var pageLang = findDescrByRegEx(source, /<meta\sname="i18nLocale"\scontent="(.*?)">/i);
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

        var location = getMasByKey('$type', data, 'com.linkedin.voyager.common.NormBasicLocation');
        if (location.countryCode) {
            user.country = location.countryCode;
        }

        if (linkedinMainInfoArray.miniProfile) {
            var miniProfile = getMasByKey('entityUrn', data, linkedinMainInfoArray.miniProfile);

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
            var data_ = [];
            var logos = getAll('$type', linkedinPerson, 'com.linkedin.voyager.identity.profile.Picture');
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
            var data_ = [];
            var urls = getAll('$id', linkedinPerson, linkedinMainInfoArray.miniProfile + ',picture,com.linkedin.common.VectorImage');
            if (urls) {
                void 0;
                for (var key in urls) {
                    if (urls[key].rootUrl && (urls[key].rootUrl.indexOf('profile-displayphoto-shrink') !== -1)) {
                        var rootUrl = urls[key].rootUrl;
                        break;
                    }
                }
            }

            var data_ = [];
            var logos = getAll('$type', linkedinPerson, 'com.linkedin.common.VectorArtifact');
            if (logos) {
                void 0;
                for (var key in logos) {
                    if (logos[key].height && logos[key].width && (logos[key].height == 800) && (logos[key].width == 800) &&
                        logos[key].fileIdentifyingUrlPathSegment && logos[key].$id && (logos[key].$id.indexOf(linkedinMainInfoArray.miniProfile) == 0)) {
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

        var data_ = [];
        var skills = getAll('$type', data, 'com.linkedin.voyager.identity.profile.Skill');
        if (skills) {
            user.skills = [];
            for (var key in skills) {
                if (skills[key].name) {
                    user.skills.push(skills[key].name);
                }
            }
        }

        user.current = [];
        user.previous = [];

        var data_ = [];
        var companies = getAll('$type', data, 'com.linkedin.voyager.identity.profile.Position');

        for (var company in companies) {
            if (companies[company].companyName) {
                var job = {};
                job.company_name = companies[company].companyName.trim();
                job.position = companies[company].title.trim();

                if (companies[company].companyUrn) {
                    job.source_id = companies[company].companyUrn.replace('urn:li:fs_miniCompany:', '');
                }

                if (companies[company].timePeriod) {
                    var timedPeriod = getMasByKey('$id', data, companies[company].timePeriod);

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
                            var startBlock = getMasByKey('$id', data, timedPeriod.startDate);
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
                            var endBlock = getMasByKey('$id', data, timedPeriod.endDate);
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

    getCompanyInfo(source) {
        function getDataFromPage(source) {
            var arData = [];
            var matches;
            var reg = /<code.+?>([\s\S]+?)<\/code>/ig;
            while (matches = reg.exec(source)) {
                if (matches[1]) {
                    var obj = {};
                    try {
                        obj = JSON.parse(matches[1].trim());
                        if (obj) {
                            arData.push(obj);
                        } else {
                            obj = matches[1].trim();
                        }
                    } catch (e) {}
                }
            }
            return arData;
        }

        function getAll(field, data, type) {
            for (var key in data) {
                if ((key === field) && (data[key] === type)) {
                    data_.push(data);
                } else {
                    if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                        getAll(field, data[key], type);
                    }
                }
            }

            return data_;
        }

        function getMasByKey(field, data, type) {
            for (var key in data) {
                if ((key === field) && (data[key] === type)) {
                    data__ = data;
                } else {
                    if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                        getMasByKey(field, data[key], type);
                    }
                }
            }

            return data__;
        }

        var data = [];

        data = getDataFromPage(source);

        if (!data || (data.length == 0)) {
            return undefined;
        }

        var data_ = [];
        var companies = getAll('$type', data, 'com.linkedin.voyager.organization.Company');
        if (!companies) {
            return undefined;
        }

        var company = {};
        var result = {};

        for (var key in companies) {
            if (companies[key].staffCount || companies[key].companyPageUrl) {
                company = companies[key];
                break;
            }
        }

        if (!company) {
            return undefined;
        }

        result.name = company.name;

        if (company.companyPageUrl) {
            result.url = company.companyPageUrl;
        }

        if (company.description) {
            var description = company.description.replace('\n', ' ');

            if (description) {
                var emails = searchEmailsO(description);
                if (emails) {
                    company.emails = emails;
                }
            }
        }

        if (company.industries) {
            result.industry = company.industries[0];
        }

        if (company.type) {
            result.type = company.type;
        }

        if (company.specialities) {
            result.comp_tags = company.specialities;
        }

        if (company.foundedOn) {
            var founded = getMasByKey('$id', data, company.foundedOn);

            if (founded && founded.year) {
                result.founded = founded.year;
            }
        }

        if (company.entityUrn) {
            result.source_id = company.entityUrn.replace('urn:li:fs_normalized_company:', '');
        }

        if (result.source_id) {
            result.source_page = 'https://www.linkedin.com/company/' + result.source_id;
        }

        if (company.staffCount) {
            result.size = getCodeSize(company.staffCount);
        }

        if (company.logo) {
            var dataLogo = getMasByKey('$id', data, company.logo + ',image,com.linkedin.common.VectorImage');

            if (dataLogo && dataLogo.rootUrl) {
                var rootUrl = dataLogo.rootUrl;

                if (rootUrl && dataLogo.artifacts && (dataLogo.artifacts.length > 0)) {
                    var params = getMasByKey('$id', data, dataLogo.artifacts[0]);
                    if (params && params.fileIdentifyingUrlPathSegment) {
                        result.logo = rootUrl + $('<textarea/>').html(params.fileIdentifyingUrlPathSegment).text();
                    }
                }
            }
        }

        if (company.headquarter) {
            var dataPostal = getMasByKey('$id', data, company.headquarter);
            if (dataPostal) {
                if (dataPostal.country) {
                    result.country = dataPostal.country;
                }
                if (dataPostal.city) {
                    result.city = dataPostal.city;
                }
                if (dataPostal.geographicArea) {
                    result.state = dataPostal.geographicArea;
                }
                if (dataPostal.line1) {
                    result.street = dataPostal.line1;
                }
                if (dataPostal.line2) {
                    result.street2 = dataPostal.line2;
                }
            }
        }

        var pageLang = findDescrByRegEx(source, /<meta\sname="i18nLocale"\scontent="(.*?)">/i);
        if (pageLang) {
            company.page_lang = pageLang.toLowerCase();
        }

        result.source = 'linkedIn';

        return result;
    }
}