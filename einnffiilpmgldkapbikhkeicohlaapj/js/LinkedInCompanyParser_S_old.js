const REG_JSON_BLOCKS2_C_S = /<code.+?><!--([\s\S]+?)--><\/code>/ig;
const REG_EMAILS_C_S = /\b[a-z\d-][_a-z\d-+]*(?:\.[_a-z\d-+]*)*@[a-z\d]+[a-z\d-]*(?:\.[a-z\d-]+)*(?:\.[a-z]{2,63})\b/gi;

function getDataFromPage_C_S(source) {
    var arData = [];
    while (matches = REG_JSON_BLOCKS2_C_S.exec(source)) {
        if (matches[1]) {
            var obj = {};
            try {
                obj = JSON.parse(matches[1].trim());
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
                    try {
                        var resp = resp.replace(/""/ig, '" "');
                        resp = resp.replace(/\s".*?"\s/ig, ' ');
                        obj = JSON.parse(resp);
                        if (obj) {
                            arData.push(obj);
                        }
                    } catch (e) {
                        try {
                            var resp = $("<textarea/>").html(resp).text();
                            obj = JSON.parse(resp);
                            if (obj) {
                                arData.push(obj);
                            }
                        } catch (e) {
                        }
                    }
                }
            }
        }
    }
    return arData;
}

function getCompanyInfo_C_S(source) {
    var data = getDataFromPage_C_S(source);

    if (data[1] && data[1].account) {
        var profile = data[1].account;

        void 0;

        var res = {};

        res.source = 'linkedIn';

        res.name = profile.name;

        if (profile.description) {
            res.emails = profile.description.match(REG_EMAILS_C_S);
        }

        if (profile.companyId) {
            res.source_id = profile.companyId;
            res.source_page = 'https://www.linkedin.com/company/' + profile.companyId;
        }

        if (profile.hqAddress) {
            res.locality = profile.hqAddress;
        }

        if (profile.website) {
            res.url = profile.website;
        }

        if (profile.thumbnailUrl) {
            res.logo = profile.thumbnailUrl;
        }

        if (profile.industry) {
            res.industry = profile.industry;
        }

        if (profile.foundingYear) {
            res.founded = profile.foundingYear;
        }

        if (profile.fmtSize) {
            res.size = getCodeSize(profile.fmtSize);
        }

        return res;
    } else {
        return undefined;
    }

    function getCodeSize(size) {
        var code = '';
        size = size.replace(' employees');
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