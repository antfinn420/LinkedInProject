const regPersonName = /class="full-name" dir="auto">(.+?)</i;
const regPersonDescription = /class="title" dir="ltr">(.+?)</i;
const regPersonIndustry = /name="industry".+?">(.+?)</i;
const regPersonLocality = /class="locality"><a href=".*?">(.+?)</i;
const regPersonCountry = /<a href="\/vsearch\/p\?countryCode=(.+?)&/i;
const regPersonCountry2 = /href="\/vsearch\/p\?f_G=(.+?)%3A/i;
const regPersonLogo = /class="profile-picture">.+?<img .*?src="(.+?)".*?>/i;
const regPersonId = /id="member-(.+?)"/i;
const regPersonPage = /class="view-public-profile">(.+?)</i;

const regPersonCurrentBlock = /class="editable-item section-item current-position">(.+?)(<\/div><\/div>|\n)/gi;
const regPersonPreviousBlock = /class="editable-item section-item past-position">(.+?)(<\/div><\/div>|\n)/gi;
const regPersonPosition = /trk=mprofile_title".*?>(.+?)</i;
const regPersonSourceId = /href="\/company\/(.+?)\?trk=prof-exp-company-name"/i;
const regPersonCompanyName = /trk=prof-exp-company-name" dir="auto">(.+?)</i;
const regPersonCompanyName2 = /trk=prof-exp-company-name" name="company".*?dir="auto">(.+?)</i;
const regPersonSkillsBlock = /"skills-section"(.+)<\/div><\/li><\/ul>/i;
const regPersonSkills = /linkedin.com\/topic\/(.+?)\?.+?>(.+?)</gi;

const regNewPersonName = /class="pv-top-card-section__name.*">(.+?)</i;
const regNewPersonDescription = /class="pv-top-card-section__headline.*">(.+?)</i;
const regNewPersonLocality = /__location.*">(.+?)</i;
const regNewPersonLogo = /class="pv-top-card-section__photo".*>\n*\s*<img src="(.+?)"/i;
const regNewPersonPage = /(h.+linkedin\.com\/in\/.+\/)/i;
const regNewPersonSourceId = /in\/(.+)\/|in\/(.+)/i;

const regNewPersonExperienceBlock = /<li id="\d{1,15}" class="pv-profile-section__card-item position-entity ember-view">([\s\S]*)<\/li>/gmi;
const regNewPersonPositionBlock = /<li id=".{1,12}" class="pv-profile-section__.*?">([\s\S]*?)<\/li>/gmi;
const regNewPersonPositionBlock2 = /<div id="\d{1,12}" class="pv-profile-section__.+?">([\s\S]*?)<!----><\/div>/gmi;
const regNewPersonCompanyName = /alt="(.+?)"/i;
const regNewPersonCompanySourceId = /href="\/company.*\/(.+?)\//i;
const regNewPersonPosition = /">(.+?)<\/h3/i;
const regNewPersonTime = /<span>(.+ – Present)<\/span>/i;
const regNewPersonSkillsBlock = /pv-profile-section .*?pv-featured-skills-section([\s\S]*)<\/section>/i;
const regNewPersonSkills = /pv-skill-entity__skill-name.+?>(.+?)</gi;

const RegPageLang_P2 = /<meta\sname="i18nLocale"\scontent="(.*?)">/i;

var pageLang = 'en_us';
var pageUrl = '';

function findDescr(source, reg) {
    var sTemp = '';
    var fnd = source.match(reg);

    if ((fnd) && (fnd.length > 1)) {
        if (fnd[1]) {
            sTemp = fnd[1];
        } else {
            if (fnd[2]) {
                sTemp = fnd[2];
            }
        }

        sTemp = sTemp.trim();
        sTemp = convertHtmlToText(sTemp);
        return sTemp;
    } else {
        return '';
    }
}

function getPersonObject(source) {

    function getPersonSkills() {
        skillsBlock = findDescr(source, regPersonSkillsBlock);
        if (skillsBlock) {
            person.skills = [];
            while (matches = regPersonSkills.exec(skillsBlock)) {
                if (matches[1]) {
                    person.skills.push(matches[1]);
                }
            }
            void 0;
        }
    }

    function getNewPersonSkills() {
        skillsBlock = findDescr(source, regNewPersonSkillsBlock);
        if (skillsBlock) {
            person.skills = [];
            while (matches = regNewPersonSkills.exec(skillsBlock)) {
                if (matches[1]) {
                    person.skills.push(matches[1]);
                }
            }
            void 0;
        }
    }

    var person = {};

    person.name = findDescr(source, regPersonName);

    if (person.name) {
        person.description = findDescr(source, regPersonDescription);
        person.industry = findDescr(source, regPersonIndustry);
        person.locality = findDescr(source, regPersonLocality);
        person.country = findDescr(source, regPersonCountry);
        if (!person.country) {
            person.country = findDescr(source, regPersonCountry2);
        }
        person.logo = findDescr(source, regPersonLogo);

        person.source_id = findDescr(source, regPersonId);
        person.source_page = findDescr(source, regPersonPage);

        var search = source.match(regPersonCurrentBlock);
        if (search) {
            person.current = [];
            for (var iNo = 0; iNo < search.length; iNo++) {
                var job = {};
                job.company_name = decodeURIComponent(findDescr(search[iNo], regPersonCompanyName));
                job.source_id = findDescr(search[iNo], regPersonSourceId);
                job.position = findDescr(search[iNo], regPersonPosition);
                person.current.push(job);
            }
        }

        var search = source.match(regPersonPreviousBlock);
        if (search) {
            person.previous = [];
            for (var iNo = 0; iNo < search.length; iNo++) {
                var job = {};
                job.company_name = decodeURIComponent(findDescr(search[iNo], regPersonCompanyName));
                if (!job.company_name) {
                    job.company_name = decodeURIComponent(findDescr(search[iNo], regPersonCompanyName2));
                }
                job.source_id = findDescr(search[iNo], regPersonSourceId);
                job.position = findDescr(search[iNo], regPersonPosition);
                person.previous.push(job);
            }
        }

        getPersonSkills();

        return person;
    } else {
        person.name = findDescr(source, regNewPersonName);

        if (person.name) {
            person.description = findDescr(source, regNewPersonDescription);
            person.locality = findDescr(source, regNewPersonLocality);
            person.logo = findDescr(source, regNewPersonLogo);

            var search = source.match(regNewPersonPositionBlock);
            if (!search) {
                var search = source.match(regNewPersonPositionBlock2);
            }
            if (search) {
                person.current = [];
                person.previous = [];
                for (var iNo = 0; iNo < search.length; iNo++) {
                    var job = {};
                    job.company_name = decodeURIComponent(findDescr(search[iNo], regNewPersonCompanyName));
                    job.source_id = findDescr(search[iNo], regNewPersonCompanySourceId);
                    job.position = findDescr(search[iNo], regNewPersonPosition);
                    var time = findDescr(search[iNo], regNewPersonTime);
                    void 0;
                    if (time) {
                        person.current.push(job);
                    } else {
                        person.previous.push(job);
                    }
                }
            }

            getNewPersonSkills();

            return person;
        } else {
            return undefined;
        }
    }
}

function preparePersonToSend(person) {
    person.page_lang = pageLang;
    person.source = 'linkedIn';
    if (person.source_page) {
        person.source_id_2 = findDescr(person.source_page, regNewPersonSourceId);
    }

    return person;
}

function getUserInfoHtml(source, url) {
    person = getPersonObject(source);

    if (person) {
        var pageLang = findDescr(source, RegPageLang_P2);
        if (pageLang) {
            person.page_lang = pageLang.toLowerCase();
        }
        person.source_page = decodeURIComponent(findDescr(url, regNewPersonPage));

        person.emails = searchEmailsO(source);

        preparePersonToSend(person);
    }

    return person;
}


