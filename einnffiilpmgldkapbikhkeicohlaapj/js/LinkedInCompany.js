const regNewCompanyName2 = /class="org-top-card-module__name.*?>\n\s*(.+?)\s*\n/im;

var company = {};
var maListJson;
var maDefaultListId = 0;

var $userList = $('#userList');
var tablink;

function showCompanyInfo(company) {
    var $companyInfoBody = $('#companyInfoBody');

    function appendData(data, selector) {
        var $el = $companyInfoBody.find(selector);
        if (data && $el) {
            if (!$el.is(':empty')) {
                $el.append(' • ');
            }
            $el.append(data);
        }
    }

    var $image = $companyInfoBody.find('.js-contact-avatar > img');

    if (company.logo) {
        $image.attr('src', company.logo);
    } else {
        $image.attr('src', '../img/ghost_company.png');
    }

    appendData(company.name, '.js-contact-name');
    appendData(company.industry, '.js-contact-description');
    appendData(company.type, '.js-contact-info');
    appendData(company.city, '.js-contact-info');

    $companyInfoBody.find('.media').removeClass('hidden');
}

function localizeHtml() {
}

document.addEventListener('DOMContentLoaded', function () {
});

function checkPrevAddedCompanies(company, userLists) {
    var obj = {};
    obj['list'] = [];
    obj['list'].push(company.source_id);

    $.post(getMainHost() + '/api/getListsByCompaniesIds', obj, function (response) {
        if (response.result && response.list && (Object.keys(response.list).length > 0)) {
            toggleStatusClass('#companyInfoBody > .media', 'saved');
            var savedListName = getListNameById(userLists, response.list[Object.keys(response.list)[0]]);
            $('#companyInfoBody > .media').find('.js-contact-saved-list').text(savedListName).attr('title', savedListName);
        }
    });
}

function parseResponseCompany(response) {

    var jsonObj = JSON.parse(response);
    if (jsonObj && jsonObj.result) {
        localStorage['needUpdateMA'] = 1;
        toggleStatusClass('#companyInfoBody > .media', 'saved');
    } else {
        toggleStatusClass('#companyInfoBody > .media', 'error');
        if (jsonObj && jsonObj.message) {
            document.getElementById('errorMessage').innerText = jsonObj.message;
            show(document.getElementById('errorMessage'));
        }
    }
}

function sendCompanyA(companies, callback) {
    if (Array.isArray(companies)) {
        var params = 'noAuth=true&list=' + encodeURIComponent(JSON.stringify(companies));
    } else {
        var params = 'noAuth=true&list=[' + encodeURIComponent(JSON.stringify(companies)) + ']';
    }
    $.post(getMainHost() + '/api/createCompany', params, function (response) {
        void 0;
        if (callback) {
            callback();
        }
    });
}

function sendCompany(e) {
    e.preventDefault();
    $(window).trigger('contactsSaving', [e]);
    toggleStatusClass('#companyInfoBody', 'processing');

    void 0;
    var params = 'listId=' + maDefaultListId + '&list=[' + encodeURIComponent(JSON.stringify(company)) + ']';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', getMainHost() + '/api/createCompany', true);
    xhr.overrideMimeType('text/xml');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            void 0;
            parseResponseCompany(xhr.responseText);
            $(window).trigger('contactsSaved', [e])
        }
    }
    xhr.send(params);
}

function getCompany(data, url) {
    var company = getCompanyInfo(data);

    var fnd = data.match(regNewCompanyName2);
    if ((fnd) && (fnd.length > 1)) {
        if (!company || (!company.name) || (fnd[1] !== company.name)) {

            var jqxhr = $.get(url, '', function (response) {
                var company = getCompanyInfo(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
            });
            jqxhr.fail(function () {
                void 0;
                toggleStatusClass('#personInfoBody > .media', 'error');
            });

        }
    }

    return company;
}

if (chrome.tabs) {
    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

        maDefaultListId = (localStorage[LS_LastCompanyListId]) ? localStorage[LS_LastCompanyListId] : 0;

        function showGetCheck(company) {
            if (company) {
                sendCompanyA(company);
                showCompanyInfo(company);

                $(window).on('userListsLoaded', function (event, type, data) {
                    void 0;
                    showAvailableLists(data, 'userList', maDefaultListId);
                    maDefaultListId = $('#userList').val();
                    localStorage[LS_LastCompanyListId] = maDefaultListId;
                    checkPrevAddedCompanies(company, data)
                });
                getMAList('company', true);
            }
        }

        if ((tab.url.indexOf('/recruiter/') !== -1) && (tab.url.indexOf('company') !== -1)) {
            $.get(tab.url, '', function (response) {
                company = getCompanyInfo_C_R(response);
                showGetCheck(company);
            });
        } else {
            if (tab.url.indexOf('sales/company') !== -1) {

                if (localStorage['csrfToken'] && (tab.url.indexOf('people') !== -1)) {
                    var companyId = findDescrByRegEx(tab.url, /company\/(\d+?)\//i);
                    var newUrl = 'https://www.linkedin.com/sales-api/salesApiCompanies/' + companyId;
                    newUrl += '?decoration=%28entityUrn%2Cname%2Caccount%28saved%2CbizProspectUrn%2Ctags*~%28entityUrn%2Ctype%2Cvalue%29%2CnoteCount%2CcrmStatus%29%2CpictureInfo%2CcompanyPictureDisplayImage%2Cdescription%2Cindustry%2CemployeeCount%2CemployeeCountRange%2Clocation%2Cheadquarters%2Cwebsite%2Crevenue%2CformattedRevenue%2CemployeesSearchPageUrl%2Cemployees*~fs_salesProfile%28entityUrn%2CfirstName%2ClastName%2CfullName%2CpictureInfo%2CprofilePictureDisplayImage%29%29';

                    $.ajaxSetup({
                        headers: {
                            'csrf-token': localStorage['csrfToken'],
                            'x-restli-protocol-version': '2.0.0'
                        },
                        global: false,
                        type: 'GET'
                    })

                    void 0;
                    $.get(newUrl, function (response) {
                        company = getCompanyInfo_C_S(response);
                        showGetCheck(company);
                    });
                } else {
                    $.get(tab.url, '', function (response) {
                        company = getCompanyInfo_C_S(response);
                        showGetCheck(company);
                    });
                }
            } else {
                if ((tab.url.indexOf('company') !== -1) || (tab.url.indexOf('school') !== -1)) {
                    localizeHtml();
                    $('#userName').text(localStorage['userName']);
                    tablink = tab.url;

                    $.get(tab.url, '', function (response) {
                        company = getCompanyInfo(response.replace(/&quot;/ig, '"').replace(/&#92;/ig, '\\'));
                        showGetCheck(company);
                    });
                }
            }
        }

        $('#sendCompany').on('click', sendCompany);

        $userList.on('change', function () {
            maDefaultListId = $(this).val();
            localStorage[LS_LastCompanyListId] = maDefaultListId;
        });
    });
}

if (!chrome.tabs) {
    document.addEventListener('DOMContentLoaded', function () {
        showCompanyInfo(company);
    });
}