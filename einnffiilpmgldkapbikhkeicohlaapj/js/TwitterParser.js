const REG_JSON_BLOCKS_T = /class="json-data" value="(.+)">/i;
const REG_TWITTER_ACCOUNTS = /(^|\W)(@.+?)\b/gi;
const REG_URLS = /(^|\s)((https?:\/\/)[\w-]+(\.[a-z-]+)+\.?(:\d+)?(\/\S*)?)/gi;
const REG_VINE = /vineProfile[\s\S]+href="(https:\/\/vine.co\/u\/\d+)">/i;
const REG_PHONES = /\d{1,4}[-\s]?\(?[\d-\s]{1,5}\)?[\d-\s]{6,14}/ig;


function getInfo(obj, source, isCompany) {
    if (obj.name && obj.id) {
        var user = {};
        user.source = 'twitter';

        user.fullInfo = 1;

        user.name = obj.name;
        user.source_id = obj.id;
        user.source_id_2 = obj.screen_name;

        if (obj.location) {
            user.locality = obj.location;
        }
        if (obj.profile_image_url_https) {
            user.logo = obj.profile_image_url_https.replace('_normal', '_400x400');
        }

        if (isCompany && obj.url) {
            user.url = obj.url;
        }

        if (obj.description && !isCompany) {
            while (matches = REG_TWITTER_ACCOUNTS.exec(obj.description)) {
                if (matches[2]) {
                    if (!user.companies) {
                        user.companies = [];
                    }
                    if ((user.companies.indexOf(matches[2]) == -1) && (matches[2] !== obj.screen_name)) {
                        user.companies.push(matches[2]);
                    }
                }
            }
        }
        if (obj.description) {
            var emails = searchEmailsO(obj.description);
            if (emails && (emails.length > 0)) {
                if (!user.cInfo) {
                    user.cInfo = {};
                }
                user.cInfo.e = emails;
            }

            var urls = {};
            while (matches = REG_URLS.exec(obj.description)) {
                if (matches[0]) {
                    urls[matches[0].trim()] = 'CUSTOM';
                }
            }
            if (obj.url) {
                urls[obj.url] = 'CUSTOM';
            }
            if (source) {
                var vine = findDescrByRegEx(source, REG_VINE);
                if (vine) {
                    urls[vine] = 'PERSONAL';
                }
            }
            if (urls && Object.keys(urls) && (Object.keys(urls).length > 0)) {
                if (!user.cInfo) {
                    user.cInfo = {};
                }
                user.cInfo.u = urls;
            }

            var phones = {};
            while (matches = REG_PHONES.exec(obj.description)) {
                if (matches[0]) {
                    phones[matches[0].trim()] = 'custom';
                }
            }
            if (phones && Object.keys(phones) && (Object.keys(phones).length > 0)) {
                if (!user.cInfo) {
                    user.cInfo = {};
                }
                user.cInfo.p = phones;
            }
        }

        return user;
    }
}

function getUserInfoTwitter(source, isCompany) {
    var data = findDescrByRegEx(source, REG_JSON_BLOCKS_T);
    if (data) {
        var obj = JSON.parse(data);
        if (obj && obj.profile_user) {
            void 0;
            return getInfo(obj.profile_user, source, isCompany);
        }
    }
}
