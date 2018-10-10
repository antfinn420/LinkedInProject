const REG_JSON_BLOCKS_C_R = /<code.+?><!--([\s\S]+?)--><\/code>/ig;
const REG_EMAILS_C_R = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;

function getDataFromPage_C_R(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS_C_R.exec(source)) {
        if (matches[1]) {
            var obj = {};
            try {
                obj = JSON.parse(matches[1].trim());
                if (obj) {
                    arData.push(obj);
                }
            } catch (e) {
            }
        }
    }
    return arData;
}

function getCompanyInfo_C_R(source) {
    var data = getDataFromPage_C_R(source);

    var profile = data[1].company;

    if (profile) {

        var res = {};

        res.source = 'linkedIn';

        res.name = profile.name;

        if (profile.description) {
            res.emails = profile.description.match(REG_EMAILS_C_R);
        }

        if (profile.id) {
            res.source_id = profile.id;
            res.source_page = 'https://www.linkedin.com/company/' + profile.id;
        }

        if (profile.locations) {

            if (profile.locations.city) {
                res.city = profile.locations.city;
            }

            if (profile.locations.street1) {
                res.street1 = profile.locations.street1;
            }

            if (profile.locations.street2) {
                res.street2 = profile.locations.street2;
            }

            if (profile.locations.countryCode) {
                res.country = profile.locations.countryCode;
            }

            if (profile.locations.state) {
                res.country = profile.locations.state;
            }

            if (profile.locations.postalCode) {
                res.postal = profile.locations.postalCode;
            }
        }

        if (profile.websiteUrl) {
            res.url = profile.websiteUrl;
        }

        if (profile.logo) {
            res.logo = 'https://media.licdn.com/mpr/mpr/shrink_200_200' + profile.logo;
        }

        if (profile.industry) {
            res.industry = profile.industry;
        }

        if (profile.creationTime && profile.creationTime.year) {
            res.founded = profile.creationTime.year;
        }

        if (profile.employeeCountRange) {
            res.size = getCodeSize_C_R(profile.employeeCountRange);
        }

        if (profile.companyType) {
            res.type = profile.companyType;
        }

        return res;
    } else {
        return undefined;
    }

    function getCodeSize_C_R(size) {
        var code = '';
        switch (size) {
            case '1-10':
                code = 'B';
                break;
            case '11-50':
                code = 'C';
                break;
            case '51-200':
                code = 'D';
                break;
            case '201-500':
                code = 'E';
                break;
            case '501-1000':
                ccode = 'F';
                break;
            case '1001-5000':
                code = 'G';
                break;
            case '5001-10,000':
                code = 'H';
                break;
            case '10,001+':
                code = 'I';
                break;

        }

        if (code === '') {
            var mas = size.split('-');

            if (mas.length === 2) {
                size = parseInt(mas[1].replace(',', '')) / parseInt(mas[0].replace(',', '').replace('+', ''));

                if ((size > 0) && (size < 11)) {
                    code = 'B';
                } else
                    if ((size > 10) && (size < 51)) {
                        code = 'C';
                    } else
                        if ((size > 50) && (size < 201)) {
                            code = 'D';
                        } else
                            if ((size > 200) && (size < 501)) {
                                code = 'E';
                            } else
                                if ((size > 500) && (size < 1001)) {
                                    code = 'F';
                                } else
                                    if ((size > 1000) && (size < 5001)) {
                                        code = 'G';
                                    } else
                                        if ((size > 5000) && (size < 10001)) {
                                            code = 'H';
                                        } else
                                            if (size > 10000) {
                                                code = 'I';
                                            } else
                                                code = 'A';
            } else {
                size = parseInt(mas[0].replace(',', '').replace('+', ''))
                if (size > 1000) {
                    code = 'I';
                }
            }
        }

        return code;
    }

}