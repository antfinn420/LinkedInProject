const regPersonBlock = /<li.*class="search-result[\s\S]+?<\/li>/gi;
const regPersonName = /<span.*class=".*name.*actor-name.*?">(.+?)<\/span>/mi;
const regPersonId = /href="\/in\/(.+)\/"/i;
const regPersonCurrentBlock = /<dt class="label">Current<\/dt><dd>(.+?)<\/dd>/i;
const regPersonPreviousBlock = /<dt class="label">Past<\/dt><dd>(.+?)<\/dd>/i;
const regPersonCurrent = /<p class=".+?">(.+?)<\/p>/ig;
const regPersonPosition = />(.+?) at/i;
const regPersonPosition2 = /(.+?) at/i;
const regPersonCompany = /at <b class=".*?">(.+)/i;
const regPersonCompany2 = /at (.+)</i;
const regPersonCompany3 = /at (.+)/i;
const regPersonDescription = /<p.*class="subline-level-1.*search-result__truncate">\s*([\s\S]+?)\s*<\/p>/mi;
const regPersonIndustry = /Industry<\/dt><dd>(.+?)</i;
const regPersonLocality = /<p.*class="subline-level-2.*search-result__truncate">\s*([\s\S]+?)\s*<\/p>/mi;
const regPersonImage = /background-image: url\("(.+?)"\)/i;
const regNewPersonBlock = /<li id="ember.+?" class="search-result search-entity search-result--person.*">([\s\S]*?)<\/li>/gi;
const regNewPersonName = /class="name actor-name.*?">(.+?)</i;
const regNewPersonDescription = /subline-level-1 .*? search-result_.*?">(.*?)</i;
const regNewPersonLocality = /subline-level-2 .*? search-result_.*?">\n\s*(.*?)\n/mi;
const regNewPersonImage = /<img class="lazy-image loaded".*src="(.*?)"/i;
const regNewSourceId = /href="\/in\/(.+?)\//i;
const regNewPersonSourceId = /in\/.+\/|in\/(.+)/i;
const regNewPersonCurrentBlock = /Current:([\s\S]*?)<\/p/i;
const regNewPersonPreviousBlock = /Past:([\s\S]*?)<\/p/i;

const regCompanyBlock = /<li class="mod result idx\d{1,2} company.+?<\/div><\/li>/gmi;
const regCompanyName = /<a class="title main-headline" href=".+?">(.+?)<\/a>/mi;
const regCompanyDescription = /<div class="description">(.+?)<\/div>/mi;
const regCompanyLocality = /<bdi dir="ltr".*>(.+)<\/bdi><\/dd>/mi;
const regCompanySourceId = /data-li-entity-id="(\d+?)"/mi;
const regCompanySize = /class="demographic">.+?<\/dt><dd>(.+?)<\/dd><\/dl>/mi;
const regCompanySize2 = /([\d-,+]{4,11})/i;
const regCompanyLogo = /class="entity-img".*?src="(.+?)".*?>/mi;
const regNewCompanyBlock = /<li id="ember.+?" class="search-result search-entity company.*">([\s\S]*?)<\/li>/gmi;
const regNewCompanySourceId = /href=".*?\/company.*?\/(\d{1,15})\//i;
const regNewCompanyName = /class="search-result__title.*?">\s*([\s\S]+?)\s*</i;
const regNewCompanyIndustry = /class="subline-level-1.*?">(.+?)</i;
const regNewCompanySize = /class="subline-level-2.*?">(.+?)</i;
const regNewCompanyLogo = /background-image: url\("(.+?)"\)/i;


const regMyUserBlock = /id="card-\d+?".*?data-unique-id="\d+?">(.*?)<\/li>/gmi;
const regMyPersonName = /mn-person-info__name[\s\S]+?>\n*\s*([\s\S]+?)\s*</i;

const regNewMyUserBlock = /mn-person-card[\s\S]*?>([\s\S]+?)<\/li>/gmi;
const regNewMyPersonName = /mn-person-info__name[\s\S]+?>\n*\s*([\s\S]+?)\s*</i;
const regNewMyPersonDescription = /mn-person-info__occupation[\s\S]*?>\n*\s*(.+?)\n*\s*</i;
const regNewMyPersonImage = /<img class="lazy-image.*".*src="(.*?)"/i;
const regNewMyPosition1 = /^(.+?)\s+at\s/i;
const regNewMyPosition2 = /^(.+?)\s[-|–|@|\(|в]\s*/i;
const regNewMyPosition3 = /^(.+?)\sin\s/i;
const regNewMyPosition4 = /^(.+?)\sbei\s/i;
const regNewMyPosition5 = /^(.+?)\s*,\s/i;

const regNewMyCompany1 = /\sat\s+(.+)$/i;
const regNewMyCompany2 = /\s[-|–|@|\(|в]\s*(.+?)\)*$/i;
const regNewMyCompany3 = /\sin\s+(.+)$/i;
const regNewMyCompany4 = /\sbei\s*(.+)$/i;
const regNewMyCompany5 = /,\s+(.+)$/i;
const regNewMyCompanyAlt = /type="company-icon"[\s\S]+?mn-person-info_.*?>\s*\n*(.+?)\s*\n*</i;

const regGooglePersonBlock = /<div class="g"><!--m-->(.+?linkedin.com\/in.+?)<!--n--><\/div>/gi;
const regGooglePersonName = /<a href=".+?">(.+?)\s[-|\|]/i;
const regGooglePersonSourcePage = /<a href="(.+?)["|\?]/i;
const regGooglePersonSourceId2 = /in\/(.+)/i;
const regGooglePersonDescription = /class="slp f">.+?\s-\s(.+?)\s-/i;
const regGooglePersonLocality = /class="f slp">(.+?)\s-/i;

const regGroupPersonBlock = /<div class="member-entity.*?">(.+)?<\/a><\/div>/gi;
const regGroupPersonName = /class="js-hovercard entity-name-text.+?>(.+?)</i;
const regGroupPersonDescription = /class="entity-headline.*?>(.+?)</i;
const regGroupPersonImage = /<img .*?src="(.*?)"/i;
const regGroupSourceId = /href=".*\/in\/(.+?)"/i;

const regAlumniPersonBlock = /(id="card-\d+".*?>.+?<\/li><\/ul>)/gi;
const regAlumniPersonName = /<a class="title".*?title="(.+?)"/i;
const regAlumniSourceId = /id="card-(\d+)"/i;
const regAlumniPersonImage = /<img.*src="(.*?)"/i;
const regAlumniPersonLink = /<a class="title" href="(.+?)"/i;


const regPageLang = /class="selected .+? lang="(.+?)">/mi;


const regSearchResults = /({"data":{".+com.linkedin.voyager.search.SearchCluster".+})\s*<\/code>?/i;


var pageLang = 'en_us';

var companies = [];
var people = [];
var maListJsonCompany = {};
var maListJsonPeople = {};
var maDefaultCompanyListId = 0;
var maDefaultPeopleListId = 0;
var index_num = 0;

var personTemplate = $('#personTemplate').html();
var companyTemplate = $('#companyTemplate').html();

$body = $('body');
$peopleList = $('#peopleList');
$companiesList = $('#companiesList');
$countPeople = $('#countPeople');
$countSelectedPeople = $('#countSelectedPeople');
var $countCompanies = $('#countCompanies');
var $countSelectedCompanies = $('#countSelectedCompanies');

function findDescr(source, reg) {
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

function parsePersonBlock(source) {
    var person = {};

    person.name = findDescr(source, regPersonName);
    if (person.name && (person.name !== 'LinkedIn Member')) {
        person.source = 'linkedIn';

        person.source_id_2 = decodeURIComponent(findDescr(source, regPersonId));
        person.searchLink = '/in/' + person.source_id_2;

        person.description = findDescr(source, regPersonDescription);

        var currentBlock = findDescr(source, regPersonCurrentBlock);
        if (currentBlock) {
            var search = currentBlock.match(regPersonCurrent);
            if (search) {
                person.current = [];
                for (var iNo = 0; iNo < search.length; iNo++) {
                    var job = {};

                    job = detectPositionByDescription(convertHtmlToText(search[iNo]));
                    if (job && job.position && job.company_name) {
                        person.current = [];
                        person.current.push(job);
                    }

                    person.current.push(job);
                }
            }
        } else {
            if (person.description) {
                job = detectPositionByDescription(person.description);
                if (job && job.position && job.company_name) {
                    person.current = [];
                    person.current.push(job);
                }
            }
        }

        var previousBlock = findDescr(source, regPersonPreviousBlock);
        if (previousBlock) {
            var search = previousBlock.match(regPersonCurrent);
            if (search) {
                person.previous = [];
                for (var iNo = 0; iNo < search.length; iNo++) {
                    var job = {};
                    job.position = findDescr(search[iNo], regPersonPosition);
                    job.company_name = findDescr(search[iNo], regPersonCompany2);
                    person.previous.push(job);
                }
            }
        }

        person.locality = findDescr(source, regPersonLocality);
        if (source.indexOf('ghost-person') == -1) {
            person.logo = findDescr(source, regPersonImage);
        }

        return person;
    } else {
        return undefined;
    }
}

function detectPositionByDescription(description) {
    if (description) {
        var job = {};

        job.position = findDescr(description, regNewMyPosition1);
        if (!job.position) {
            job.position = findDescr(description, regNewMyPosition2);
        }
        if (!job.position) {
            job.position = findDescr(description, regNewMyPosition3);
        }
        if (!job.position) {
            job.position = findDescr(description, regNewMyPosition4);
        }
        if (!job.position) {
            job.position = findDescr(description, regNewMyPosition5);
        }

        if (job.position) {

            job.company_name = findDescr(description, regNewMyCompany1);
            if (!job.company_name) {
                job.company_name = findDescr(description, regNewMyCompany2);
            }
            if (!job.company_name) {
                job.company_name = findDescr(description, regNewMyCompany3);
            }
            if (!job.company_name) {
                job.company_name = findDescr(description, regNewMyCompany4);
            }
            if (!job.company_name) {
                job.company_name = findDescr(description, regNewMyCompany5);
            }

            if (job.position && job.company_name) {
                return job;
            }
        }
    }
}

function parseNewMyPersonBlock(source) {
    var person = {};

    person.name = findDescr(source, regNewMyPersonName)
    if (person.name && (person.name !== 'LinkedIn Member')) {

        person.source_id_2 = decodeURIComponent(findDescr(source, regNewSourceId));

        person.description = findDescr(source, regNewMyPersonDescription);
        if (person.description) {
            job = detectPositionByDescription(person.description);
            if (job && job.position && job.company_name) {
                person.current = [];
                person.current.push(job);
            }
        }

        job = {};
        job.company_name = findDescr(source, regNewMyCompanyAlt);
        if (job.company_name) {
            job.position = 'Employee';
            person.previous = [];
            person.previous.push(job);
        }

        person.logo = findDescr(source, regNewMyPersonImage);

        return person;
    } else {
        return undefined;
    }
}

function parseGroupPersonBlock(source) {
    var person = {};

    person.name = findDescr(source, regGroupPersonName)
    if (person.name && (person.name !== 'LinkedIn Member')) {

        person.source_id_2 = decodeURIComponent(findDescr(source, regGroupSourceId));

        person.description = findDescr(source, regGroupPersonDescription);


        person.logo = findDescr(source, regGroupPersonImage);

        return person;
    } else {
        return undefined;
    }
}

function parseAlumniPersonBlock(source) {
    var person = {};

    person.name = findDescr(source, regAlumniPersonName)
    if (person.name && (person.name !== 'LinkedIn Member')) {

        person.source_id = findDescr(source, regAlumniSourceId);


        person.logo = findDescr(source, regAlumniPersonImage);

        person.searchLink = findDescr(source, regAlumniPersonLink);

        return person;
    } else {
        return undefined;
    }
}

function parseGooglePersonBlock(source) {
    var person = {};

    person.name = findDescr(source, regGooglePersonName)
    if (person.name && (person.name !== 'LinkedIn Member')) {

        person.source_page = decodeURIComponent(findDescr(source, regGooglePersonSourcePage));
        if (person.source_page) {
            person.source_id_2 = findDescr(person.source_page, regGooglePersonSourceId2);
        }

        person.description = findDescr(source, regGooglePersonDescription);
        if (person.description) {
            job = detectPositionByDescription(person.description);
            if (job && job.position && job.company_name) {
                person.current = [];
                person.current.push(job);
            }
        }

        person.source = 'linkedIn';
        return person;
    } else {
        return undefined;
    }
}

function parseMyPersonBlock(source) {
    var person = {};

    person.name = findDescr(source, regMyPersonName)
    if (person.name && (person.name !== 'LinkedIn Member')) {

        person.source_id_2 = decodeURIComponent(findDescr(source, regSourceId));

        person.description = findDescr(source, regMyPersonDescription);
        if (person.description) {
            job = detectPositionByDescription(person.description);
            if (job && job.position && job.company_name) {
                person.current = [];
                person.current.push(job);
            }
        }

        job = {};
        job.company_name = findDescr(source, regMyCompanyAlt);
        if (job.company_name) {
            job.position = 'Employee';
            person.previous = [];
            person.previous.push(job);
        }

        person.logo = findDescr(source, regMyPersonImage);

        return person;
    } else {
        return undefined;
    }
}

function parseNewPersonBlock(source) {
    var person = {};

    function ParseCurrent_v1() {
        var currentBlock = findDescr(source, regPersonCurrentBlock);
        if (currentBlock) {
            var search = currentBlock.match(regPersonCurrent);
            if (search) {
                person.current = [];
                for (var iNo = 0; iNo < search.length; iNo++) {
                    var job = {};
                    job.position = findDescr(search[iNo], regPersonPosition);
                    job.company_name = findDescr(search[iNo], regPersonCompany2);
                    person.current.push(job);
                }
            }
        }
    }

    function ParseCurrent_v2() {
        var current = findDescr(source, regNewPersonCurrentBlock);
        if (current) {
            var job = {};
            job.position = findDescr(current, regPersonPosition2);
            job.company_name = findDescr(current, regPersonCompany3);
            if (job.position && job.company_name) {
                person.current = [];
                person.current.push(job);
            }
        }
    }

    person.name = findDescr(source, regNewPersonName)
    if (person.name && (person.name !== 'LinkedIn Member')) {
        person.source_id_2 = decodeURIComponent(findDescr(source, regNewSourceId));
        person.description = findDescr(source, regNewPersonDescription);

        ParseCurrent_v1(source);
        if ((!person.current) || (person.current.Count == 0)) {
            ParseCurrent_v2(source);
        }

        var currentBlock = findDescr(source, regNewPersonCurrentBlock);
        if (currentBlock) {
            job = detectPositionByDescription(currentBlock);
            if (job && job.position && job.company_name) {
                if (!person.current) {
                    person.current = [];
                }
                person.current.push(job);
            }
        }

        if ((!person.current) || (person.current.Count == 0)) {
            if (person.description) {
                job = detectPositionByDescription(person.description);
                if (job && job.position && job.company_name) {
                    person.current = [];
                    person.current.push(job);
                }
            }
        }

        var previousBlock = findDescr(source, regNewPersonPreviousBlock);
        if (previousBlock) {
            job = detectPositionByDescription(previousBlock);
            if (job && job.position && job.company_name) {
                person.previous = [];
                person.previous.push(job);
            }
        } else {
            previousBlock = findDescr(source, regPersonPreviousBlock);
            if (previousBlock) {
                var search = previousBlock.match(regPersonCurrent);
                if (search) {
                    person.previous = [];
                    for (var iNo = 0; iNo < search.length; iNo++) {
                        var job = {};
                        job.position = findDescr(search[iNo], regPersonPosition);
                        job.company_name = findDescr(search[iNo], regPersonCompany2);
                        person.previous.push(job);
                    }
                }
            }
        }

        person.locality = findDescr(source, regNewPersonLocality);
        person.logo = findDescr(source, regNewPersonImage);

        return person;
    } else {
        return undefined;
    }
}

function getPeople(source, google) {
    var people = [];
    if (google) {
        var search = source.match(regGooglePersonBlock);
        if (search) {
            for (var iNo = 0; iNo < search.length; iNo++) {
                var person = parseGooglePersonBlock(search[iNo]);
                if (person) {
                    people.push(person);
                }
            }
        }
    } else {
        var search = source.match(regPersonBlock);
        if (search) {
            for (var iNo = 0; iNo < search.length; iNo++) {
                var person = parsePersonBlock(search[iNo]);
                if (person) {
                    people.push(person);
                }
            }
        } else {
            var search = source.match(regNewPersonBlock);
            if (search) {
                for (var iNo = 0; iNo < search.length; iNo++) {
                    var person = parseNewPersonBlock(search[iNo]);
                    if (person) {
                        people.push(person);
                    }
                }
            } else {
                var search = source.match(regNewMyUserBlock);
                if (search) {
                    for (var iNo = 0; iNo < search.length; iNo++) {
                        var person = parseNewMyPersonBlock(search[iNo]);
                        if (person) {
                            people.push(person);
                        }
                    }
                } else {
                    var search = source.match(regGroupPersonBlock);
                    if (search) {
                        for (var iNo = 0; iNo < search.length; iNo++) {
                            var person = parseGroupPersonBlock(search[iNo]);
                            if (person) {
                                people.push(person);
                            }
                        }
                    } else {
                        var search = source.match(regAlumniPersonBlock);
                        if (search) {
                            for (var iNo = 0; iNo < search.length; iNo++) {
                                var person = parseAlumniPersonBlock(search[iNo]);
                                if (person) {
                                    people.push(person);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return people;
}

function parseCompanyBlock(source) {
    var company = {};

    company.name = findDescr(source, regCompanyName)
    if (company.name && (company.name !== 'LinkedIn Member')) {
        company.industry = findDescr(source, regCompanyDescription);
        company.locality = findDescr(source, regCompanyLocality);
        company.source_id = findDescr(source, regCompanySourceId);
        company.size = findDescr(source, regCompanySize);
        company.logo = findDescr(source, regCompanyLogo);

        return company;
    } else {
        return undefined;
    }
}

function parseNewCompanyBlock(source) {
    var company = {};

    company.name = findDescr(source, regNewCompanyName)
    if (company.name && (company.name !== 'LinkedIn Member')) {
        company.industry = findDescr(source, regNewCompanyIndustry);
        company.source_id = findDescr(source, regNewCompanySourceId);
        company.size = findDescr(source, regNewCompanySize);
        company.logo = findDescr(source, regNewCompanyLogo);

        return company;
    } else {
        return undefined;
    }
}

function getCompanies(source) {
    source = source.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
    pageLang = findDescr(source, regPageLang);
    pageLang = pageLang.toLowerCase();

    var companies = [];
    var search = source.match(regCompanyBlock);
    if (search) {
        for (var iNo = 0; iNo < search.length; iNo++) {
            var company = parseCompanyBlock(search[iNo]);
            if (company) {
                companies.push(company);
            }
        }
        return companies;
    } else {
        var search = source.match(regNewCompanyBlock);
        if (search) {
            for (var iNo = 0; iNo < search.length; iNo++) {
                var company = parseNewCompanyBlock(search[iNo]);
                if (company) {
                    companies.push(company);
                }
            }
            return companies;
        } else {
            return undefined;

        }
    }
}

function prepareCompanyToSend(company) {
    company.size = findDescr(company.size, regCompanySize2);
    switch (company.size) {
        case '1-10':
            company.size = 'B';
            break;
        case '11-50':
            company.size = 'C';
            break;
        case '51-200':
            company.size = 'D';
            break;
        case '201-500':
            company.size = 'E';
            break;
        case '501-1000':
            company.size = 'F';
            break;
        case '1001-5000':
            company.size = 'G';
            break;
        case '5001-10,000':
            company.size = 'H';
            break;
        case '10,001+':
            company.size = 'I';
            break;
        default:
            company.size = 'A';
    }
    if (company.comp_tags) {
        company.comp_tags = company.comp_tags.replace(/, /g, ',');
        company.comp_tags = company.comp_tags.split(',');
    }

    company.lang = pageLang;
    company.source = 'linkedIn';

    return company;
}

function getAll_ar(field, data, type) {
    for (key in data) {
        if ((key === field) && (data[key] === type)) {
            this.data.push(data);
        } else {
            if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                getAll_ar(field, data[key], type);
            }
        }
    }

    return this.data;
}

function getMasByKey_ar(field, data, type) {
    for (key in data) {
        if ((key === field) && (data[key] === type) && (data.publicIdentifier)) {
            this.data = data;
        } else {
            if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                getMasByKey_ar(field, data[key], type);
            }
        }
    }

    return this.data;
}

function tryGetIdentifiers(source, people) {
    var currentBlock = findDescr(source, regSearchResults);

    var obj = {};
    try {
        obj = JSON.parse(currentBlock.trim());
    } catch (e) {
        try {
            var resp = currentBlock.trim().replace(/\\n\\n"/ig, ' ').replace(/"\\n\\n/ig, ' ');
            obj = JSON.parse(resp);
        } catch (e) {
            try {
                var resp = resp.replace(/""/ig, '" "');
                resp = resp.replace(/\s".*?"\s/ig, ' ');
                obj = JSON.parse(resp);
            } catch (e) {
                try {
                    var resp = $("<textarea/>").html(resp).text();
                    obj = JSON.parse(resp);
                } catch (e) {
                    void 0;
                    void 0;
                }
            }
        }
    }

    idsCount = 0;
    if (obj && obj.included) {

        this.data = [];
        var arrays = getAll_ar('$type', obj, 'com.linkedin.voyager.search.SearchHit');
        void 0;

        if (arrays) {
            var arrTrackingIds = [];
            for (var iNo = 0; iNo < arrays.length; iNo++) {
                if (arrays[iNo].trackingId) {
                    arrTrackingIds.push(arrays[iNo].trackingId);
                }
            }
            void 0;

            if (arrTrackingIds.length > 0) {
                for (var iNo = 0; iNo < arrTrackingIds.length; iNo++) {
                    this.data = [];
                    var profile = getMasByKey_ar('trackingId', obj.included, arrTrackingIds[iNo]);
                    if (profile && profile.publicIdentifier) {
                        for (iP = 0; iP < people.length; iP++) {
                            if (people[iP].name == (profile.firstName + ' ' + profile.lastName)) {
                                people[iP].source_id_2 = profile.publicIdentifier;
                                idsCount++;
                            }
                        }
                    }
                }
                void 0;
            }
        }
    }
    return ((idsCount > 0) && (people.length / idsCount) > 2);
}


function getIdentifiers(source, callback, people, data, url) {
    if (!tryGetIdentifiers(source, people)) {
        $.get(url, '', function (response) {
            tryGetIdentifiers(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'), people);
            if (callback) {
                callback(people, data);
            }
        });
    } else {
        if (callback) {
            callback(people, data);
        }
    }
}