const REG_JSON_BLOCKS = /<code.+?>([\s\S]+?)<\/code>/ig;
const COMPANIES_IDENT = 'com.linkedin.voyager.organization.Company';
const RegPageLang = /<meta\sname="i18nLocale"\scontent="(.*?)">/i;

function getDataFromPage(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS.exec(source)) {
        if (matches[1]) {
            var obj = {};
            try {
                obj = JSON.parse(matches[1].trim());
                if (obj) {
                    arData.push(obj);
                } else {
                    obj = matches[1].trim();
                }
            } catch (e) {
            }
        }
    }
    return arData;
}

function getMasByKey(field, data, type) {
    for (key in data) {
        if ((key === field) && (data[key] === type)) {
            this.data = data;
        } else {
            if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                getMasByKey(field, data[key], type);
            }
        }
    }

    return this.data;
}

function getAll(field, data, type) {
    for (key in data) {
        if ((key === field) && (data[key] === type)) {
            this.data.push(data);
        } else {
            if ((typeof data[key] === 'object') || (typeof data[key] === 'array')) {
                getAll(field, data[key], type);
            }
        }
    }

    return this.data;
}

function getCompanySizeCode(staffCount) {
    if (staffCount >= 10001) {
        return 'I';
    } else if (staffCount >= 5001 && staffCount < 10001) {
        return 'H';
    } else if (staffCount < 5001 && staffCount >= 1001) {
        return 'G';
    } else if (staffCount >= 501 && staffCount < 1001) {
        return 'F';
    } else if (staffCount >= 201 && staffCount < 501) {
        return 'E';
    } else if (staffCount >= 51 && staffCount < 201) {
        return 'D';
    } else if (staffCount >= 11 && staffCount < 51) {
        return 'C';
    } else if (staffCount < 11 && staffCount >= 1) {
        return 'B';
    } else {
        return 'A';
    }
}

function getCompanyInfo(source) {
    source = source.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\');
    var data = [];

    data = getDataFromPage(source);

    if (!data || (data.length == 0)) {
        return undefined;
    }

    this.data = [];
    var companies = getAll('$type', data, COMPANIES_IDENT);
    if (!companies) {
        return undefined;
    }

    var company = {};
    var result = {};

    for (key in companies) {
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
        result.size = getCompanySizeCode(company.staffCount);
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

    var pageLang = findDescr_C(source, RegPageLang);
    if (pageLang) {
        company.page_lang = pageLang.toLowerCase();
    }

    result.source = 'linkedIn';

    return result;
}

function findDescr_C(source, reg) {
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
