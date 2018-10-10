const regCompanyName = /">\s*(.+)\s*?<\/h1>/i;
const regCompanyIndustry = /"company-industries\s.+">\s*(.+)\s*?<\//i;
const regCompanyUrl = /<a rel="noopener noreferrer" target="_blank" href="(\S+)"\s/i;
const regCompanyStreet = /itemprop="streetAddress">(.+?)</i;
const regCompanyLocality = /"org-top-card-module__location\s.+">\s*(.+)\s*?<\//i;
const regCompanyPostal = /itemprop="postalCode">(.+?)</i;
const regCompanyCountry = /itemprop="addressCountry">(.+?)</i;
const regCompanyLogo = /<img class="lazy-image\sorg-top-card-module__logo.+?src="(.+?)"/i;
const regCompanyType = /class="type">.*?<p>(.+?)<\/p/i;
const regCompanyFounded = /class="founded">.*?<p>(.+?)<\/p>/i;
const regCompanySpecialties = /class="specialties">.+?<p>(.+?)</i;
const regCompanyId = /topcard_see_jobs"\shref=".*\/([\d+]{3,8})\/jobs/i;
const regCompanySize = /"company-size\s.+">\s*(.+)\s*?<\//i;
const regCompanySize2 = /([\d-,+]{4,11})/i;
const regCompanyPage = /<link rel="canonical" href="(.+?)">/i;
const regCompanyRegion = /itemprop="addressRegion">(.+?)</i;

const regNewCompanyName = /class="org-top-card-module__name.*?>\n\s*(.+?)\s*\n/im;
const regNewCompanyIndustry = /class=".*company-industries.*?>(.+?)<</i;
const regNewCompanyIndustry2 = /class=".*industry.*?>(.+?)</i;
const regNewCompanyUrl = /class=".*company-page-url.*?>\n\s*<a href="(.+?)"/i;
const regNewCompanyLogo = /<img class="lazy-image.+?src="(.+?)"/i;
const regNewCompanyType = /class="company-type.+?>(.+?)</i;
const regNewCompanyFounded = /class=".*founded-year.*?>(.+?)</i;
const regNewCompanyId = /href="https:\/\/www\.linkedin\.com\/vsearch\/p\?f_CC=(\d{1,7})/i;
const regNewCompanySize = /class=".*company-size.*?>\n\s*(.+?)\n/i;

const regNewCompanySpecialties = /class="speciality.+?>(.+?)</gi;
const regNewCompanySpecialties2 = /class="speciality.+?>(.+?)</i;
const regNewCompanyLocality = /class=".*?org-about-company-module__headquarter.*?>\n\s*(.*)\n/im;
const regNewCompanyLocality2 = /class=".*?_location.*?>\n\s*(.*)\n/im;

const regNewCompanyCity = /(.+?),</i;
const regNewCompanyRegion = /,\s*(.+)/i;
const regNewCompanyPage = /<link rel="canonical" href="(.+?)">/i;

const RegPageLang2 = /<meta\sname="i18nLocale"\scontent="(.*?)">/i;

function findDescr(source, reg) {
    if (source) {
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
}

function prepareCompanyToSend(company) {
    if (company.size && (company.size > 0)) {
        if ((company.size > 0) && (company.size < 11)) {
            company.size = 'B';
        } else
            if ((company.size > 10) && (company.size < 51)) {
                company.size = 'C';
            } else
                if ((company.size > 50) && (company.size < 201)) {
                    company.size = 'D';
                } else
                    if ((company.size > 200) && (company.size < 501)) {
                        company.size = 'E';
                    } else
                        if ((company.size > 500) && (company.size < 1001)) {
                            company.size = 'F';
                        } else
                            if ((company.size > 1000) && (company.size < 5001)) {
                                company.size = 'G';
                            } else
                                if ((company.size > 5000) && (company.size < 10001)) {
                                    company.size = 'H';
                                } else
                                    if (company.size > 10000) {
                                        company.size = 'I';
                                    } else
                                        company.size = 'A';
    }
    else {
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
            default: company.size = 'A';
        }
    }
    if (company.comp_tags && (typeof company.comp_tags === 'string' || company.comp_tags instanceof String)) {
        company.comp_tags = company.comp_tags.replace(/, /g, ',');
        company.comp_tags = company.comp_tags.split(',');
    }

    company.source = 'linkedIn';

    return company;
}

function getCompanyInfoHtml(source) {
    var company = {};
    company.name = findDescr(source, regCompanyName);

    void 0;

    if (company.name) {
        company.industry = findDescr(source, regCompanyIndustry);
        company.url = findDescr(source, regCompanyUrl);
        company.street = findDescr(source, regCompanyStreet);
        company.postal = findDescr(source, regCompanyPostal);
        company.country = findDescr(source, regCompanyCountry);
        company.logo = findDescr(source, regCompanyLogo);
        company.type = findDescr(source, regCompanyType);
        company.founded = findDescr(source, regCompanyFounded);
        company.source_id = findDescr(tablink, /\/(\d+)\/?/i);
        company.source_page = tablink;
        company.comp_tags = findDescr(source, regCompanySpecialties);
        company.size = findDescr(source, regCompanySize);
        company.state = findDescr(source, regCompanyRegion);

        company.city = findDescr(source, regCompanyLocality);
        if (company.city[company.city.length - 1] = ',') {
            company.city = company.city.substring(0, company.city.length - 1);
        }

        var pageLang = 'en_us';
        pageLang = findDescr(source, RegPageLang2);
        if (pageLang) {
            company.lang = pageLang.toLowerCase();
        }

        return prepareCompanyToSend(company);
    } else {
        company = {};
        company.name = findDescr(source, regNewCompanyName);

        if (company.name) {
            company.industry = findDescr(source, regNewCompanyIndustry);
            if (!company.industry) {
                company.industry = findDescr(source, regNewCompanyIndustry2);
            }
            company.url = findDescr(source, regNewCompanyUrl);
            company.logo = findDescr(source, regNewCompanyLogo);
            company.type = findDescr(source, regNewCompanyType);
            company.founded = findDescr(source, regNewCompanyFounded);
            company.source_id = findDescr(source, regNewCompanyId);
            var search = source.match(regNewCompanySpecialties);
            if (search) {
                company.comp_tags = [];
                for (var iNo = 0; iNo < search.length; iNo++) {
                    var tags = findDescr(search[iNo], regNewCompanySpecialties2);
                    if (tags) {
                        company.comp_tags.push(tags);
                    }
                }
            }
            company.size = findDescr(source, regNewCompanySize);
            company.logo = findDescr(source, regNewCompanyLogo);
            if (company.logo && (company.logo.indexOf('http') < 0)) {
                company.logo = '';
            }

            company.locality = findDescr(source, regNewCompanyLocality);

            if (!company.locality) {
                company.locality = findDescr(source, regNewCompanyLocality2);
            }
            if (company.locality) {
                company.state = findDescr(company.locality, regNewCompanyRegion);
                company.city = findDescr(company.locality, regNewCompanyCity);
            }

            var pageLang = 'en_us';
            pageLang = findDescr(source, RegPageLang2);
            if (pageLang) {
                company.lang = pageLang.toLowerCase();
            }
            return prepareCompanyToSend(company);
        } else {
            company.logo = findDescr(source, regNewCompanyLogo);
            if (company.logo && (company.logo.indexOf('http') < 0)) {
                company.logo = '';
            }
            company.size = findDescr(source, regNewCompanySize);

            var pageLang = 'en_us';
            pageLang = findDescr(source, RegPageLang2);
            if (pageLang) {
                company.lang = pageLang.toLowerCase();
            }

            return prepareCompanyToSend(company);
        }
    }
}

