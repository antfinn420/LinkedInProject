const regCompanyName_v2 = /itemprop="name" content="(.+?)"/mi;
const regCompanyName = /class="biz-page-title.*?">\n(.+?)\n/mi;
const regCompanyUrl = /<a href="\/biz_redir\?url=(.+?)(%3F|&amp;)/mi;
const regCompanyStreet = /itemprop="streetAddress">(.+?)</mi;
const regCompanyLocality = /itemprop="addressLocality">(.+?)</mi;
const regCompanyPostal = /itemprop="postalCode">(.+?)</mi;
const regCompanyCountry = /content="(.+?)" itemprop="addressCountry"/mi;
const regCompanyLogo = /itemprop="image" content="(.+?)">/mi;
const regCompanyCategories = /"category_aliases":\s*"(.+?)"/i;
const regCompanyId = /href="\/writeareview\/biz\/(.+?)\?/mi;
const regCompanyRegion = /itemprop="addressRegion">(.+?)</mi;
const regCompanyPhone = /itemprop="telephone">\n(.+?)\n/mi;
const regCompanyPhone_v2 = /class="biz-phone">\n(.+?)\n/mi;

const regPageLang = /\?l=(.+?)"/mi;

var pageLang = 'en_us';
var company = {};

var maDefaultListId = 0;


function appendInfo(info, bBold) {
    var element = document.createElement('div');
    if (bBold) {
        element.style = 'font-weight: bold;';
    }
    element.textContent = info;
    $('form').append(element);
}

function showCompanyInfo(company) {
    if (company.logo) {
        var element = document.createElement('img');
        element.src = company.logo;
        element.height = 100;
        $('form').append(element);
    }

    appendInfo(company.name, true);
    appendInfo(company.source_id);
    appendInfo(company.source_page);
    appendInfo(company.url);
    appendInfo(company.country);
    appendInfo(company.state);
    appendInfo(company.locality);
    appendInfo(company.street);
    appendInfo(company.postal);
    appendInfo(company.phone);
    appendInfo(company.comp_tags);
}

function localizeHtml() {
}

function findDescr(source, reg) {
    var sTemp = '';
    var fnd = source.match(reg);

    if ((fnd) && (fnd.length > 1)) {
        sTemp = fnd[1];
        sTemp = sTemp.replace('<b>', '');
        sTemp = sTemp.replace('</b>', '');
        sTemp = sTemp.trim();
        return sTemp;
    } else {
        return '';
    }
}

function prepareCompanyToSend(company) {
    company.lang = pageLang;
    if (company.comp_tags) {
        company.comp_tags = company.comp_tags.split(',');
    }

    return company;
}

function getCompanyObject(source, url) {
    var company = {};
    company.name = findDescr(source, regCompanyName);
    if (company.name == '') {
        company.name = findDescr(source, regCompanyName_v2);
    }

    if (company.name) {
        company.source = 'yelp';
        company.source_id = findDescr(source, regCompanyId);
        company.source_page = url;
        if (company.source_page.indexOf('?') >= 0) {
            company.source_page = company.source_page.slice(0, company.source_pageurl.indexOf('?'));
        }
        company.url = decodeURIComponent(findDescr(source, regCompanyUrl));
        company.country = findDescr(source, regCompanyCountry);
        company.state = findDescr(source, regCompanyRegion);
        company.locality = findDescr(source, regCompanyLocality);
        company.street = findDescr(source, regCompanyStreet);
        company.postal = findDescr(source, regCompanyPostal);
        company.phone = findDescr(source, regCompanyPhone);
        company.comp_tags = findDescr(source, regCompanyCategories);
        company.logo = findDescr(source, regCompanyLogo);

        return company;
    } else {
        return undefined;
    }
}

document.addEventListener('DOMContentLoaded', function () {
});

function sendCompany() {
    var params = 'listId=1&list=[' + JSON.stringify(company) + ']'; 
    var xhr = new XMLHttpRequest();
    xhr.open('POST', getMainHost() + '/api/createCompany', true);
    xhr.overrideMimeType('text/xml');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            void 0;
        }
    }
    xhr.send(params);
}

chrome.tabs.getSelected(null, function (tab) {
    addHeader();

    localizeHtml();
    $('#userName').text(localStorage['userName']);

    chrome.tabs.sendMessage(tab.id, { method: 'getInnerHTML' }, function (response) {
        if (response) {
            pageLang = findDescr(response.data, regPageLang);
            pageLang = pageLang.toLowerCase();

            company = getCompanyObject(response.data, tab.url);
            showCompanyInfo(company);
            prepareCompanyToSend(company);

            void 0;

            $(window).on('userListsLoaded', function (event, type, data) {
                void 0;
                showAvailableLists(data, 'userList', maDefaultListId);

                maDefaultListId = $('#userList').val();
            });
            getMAList('company', true);
        }
    });

    document.getElementById('sendCompany').addEventListener('click', sendCompany);
});
