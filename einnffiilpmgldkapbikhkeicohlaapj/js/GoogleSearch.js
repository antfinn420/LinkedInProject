const REG_GOOGLE_RESULT_SITE = /<cite class=".+?">(.+?)<\/cite>/ig;

var $domainEmails = $('#domainEmails');
var $importOptions = $('#importOptions');
var $importConfirm = $('#importConfirm');
var $userPeopleSelect = $('#userPeopleSelect');
var $waitAnimation = $('#waitAnimation');
var emailItemTemplate = $('#emailItemTemplate').html();

var maDefaultListId = 0;
var domains = [];
var domainsSelected = [];

var emailsOnly = true;
var generic = false;
var personal = false;
var others = false;
var max = 5;

function getDomainsFromGoogleSearch(source) {
    var result = [];
    while (matches = REG_GOOGLE_RESULT_SITE.exec(source)) {
        if (matches[1]) {
            var domain = tldjs.getDomain(matches[1]);
            if (result.indexOf(domain) == -1) {
                result.push(domain);
            }
        }
    }
    return result;
}

function showError() {
    $domainEmails.addClass('hidden');
    $importOptions.addClass('hidden');
    $waitAnimation.addClass('hidden');
    $importConfirm.addClass('hidden');
    $('#error').removeClass('hidden');

    checkAuthenticationUpdate(function () {
        showUserName();
    });
}

function sendEmailList(e) {
    var params = 'list={"list": ' + encodeURIComponent(convertHtmlToText(JSON.stringify(domainsSelected)))
        + '}&max=' + max + '&type=' + +emailsOnly + '&generic=' + +generic + '&personal=' + +personal + '&others=' + +others + '&success=1&listId=' + maDefaultListId;
    void 0;
    jqxhr = $.post(getMainHost() + '/api/getEmailsAndProspectsByDomains', params, function (response) {
        void 0;
        if (response && response.result) {
            $(window).trigger('contactsSaved', [e]);
        } else {
            showError();
        }
    });
    jqxhr.fail(function () {
        showError();
    });
}

function checkCountsByDomains() {
    $('#completeSearchTemplate').addClass('hidden');
    $importOptions.addClass('hidden');
    $waitAnimation.removeClass('hidden');

    emailsOnly = !($('#emailsOnly').prop('checked') === true);
    max = $('#contactsByDomain')[0].value;
    if (!emailsOnly) {
        generic = $('input[name=generic]').prop('checked');
        personal = $('input[name=personal]').prop('checked');
        others = $('input[name=others]').prop('checked');
    }

    var params = 'list={"list": ' + encodeURIComponent(convertHtmlToText(JSON.stringify(domainsSelected)))
        + '}&max=' + max + '&type=' + +emailsOnly + '&generic=' + +generic + '&personal=' + +personal + '&others=' + +others + '&success=0';
    void 0;
    var jqxhr = $.post(getMainHost() + '/api/getEmailsAndProspectsByDomains', params, function (response) {
        if (response.result) {
            $userPeopleSelect.on('change', function () {
                maDefaultListId = $userPeopleSelect.val();
                localStorage[LS_LastPeopleListId] = maDefaultListId;
            });

            $(window).on('userListsLoaded', function (event, type, data) {
                void 0;
                listData = data;
                showAvailableLists(listData, 'userPeopleSelect', maDefaultListId);
                maDefaultListId = $userPeopleSelect.val();
                localStorage[LS_LastPeopleListId] = maDefaultListId;

                $('#btnSendEmailList').removeClass('hidden');
                $userPeopleSelect.removeClass('hidden');
                $('#footer').removeClass('hidden');

                $('#btnSendEmailList').on('click', sendEmailList);

                var domains_count = 0;
                var emails_count = 0;
                var prospects_count = 0;
                var cost_count = 0;
                if (response.list) {
                    for (elem in response.list) {
                        var obj = response.list[elem];
                        cost_count += obj.cost;
                        emails_count += obj.generic + obj.personal + obj.others;
                        prospects_count += obj.prospects;
                        if ((obj.cost > 0) || (obj.generic > 0) || (obj.personal > 0) || (obj.others > 0)) {
                            domains_count++;
                        }
                    }
                }

                $('#label1').html('We found for <b>' + domains_count + '</b> domains: <b>' + emails_count + '</b> emails, <b>' + prospects_count + '</b> prospects');
                $('#label2').html('One domain search for emails costs 2 credits');
                $('#label3').html('Export will take <b>' + cost_count + '</b> credits.');

                $waitAnimation.addClass('hidden');
                $importConfirm.removeClass('hidden');
            });
            getMAList('people', true);
        } else {
            showError();
        }
        void 0;
    });
    jqxhr.fail(function () {
        showError();
    });
}

function getChar(event) {
    if (event.which == null) {
        if (event.keyCode < 32) return null;
        return String.fromCharCode(event.keyCode) 
    }

    if (event.which != 0 && event.charCode != 0) {
        if (event.which < 32) return null;
        return String.fromCharCode(event.which) 
    }

    return null; 
}

function validateNumbers(e) {
    e = e || event;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    var chr = getChar(e);
    if (chr == null) return;
    if (chr < '0' || chr > '9') {
        return false;
    }
}

function validatePageLimit() {
    if (+this.value > 100) {
        this.value = 100;
    }
}

function getSelectedDomains() {
    for (var item in domains) {
        if ($('#domain_' + item).find('input')[0].checked) {
            domainsSelected.push(domains[item]);
        }
    }
}

function checkSelectedOptions() {
    if ($('#emailsOnly').prop('checked') === true) {
        void 0;
        if ($('input[name=generic]').prop('checked') || $('input[name=personal]').prop('checked') || $('input[name=others]').prop('checked')) {
            $('#next_button').prop('disabled', false);
        } else {
            $('#next_button').prop('disabled', true);
        }
    } else {
        $('#next_button').prop('disabled', false);
    }
}

function clickNextButton() {
    if ($importOptions.hasClass('hidden')) {
        getSelectedDomains();

        $domainEmails.addClass('hidden');
        $importOptions.removeClass('hidden');

        $('#contactsByDomain').on('keypress', validateNumbers);
        $('#contactsByDomain').on('change', validatePageLimit);

        $('input[name=generic]').on('change', checkSelectedOptions);
        $('input[name=personal]').on('change', checkSelectedOptions);
        $('input[name=others]').on('change', checkSelectedOptions);
        $('#emailsOnly').on('change', checkSelectedOptions);
        $('#profilesOnly').on('change', checkSelectedOptions);

        if (localStorage['import_contactsByDomain']) {
            $('#contactsByDomain').val(localStorage['import_contactsByDomain']);
        }
        if (localStorage['import_generic']) {
            $('input[name=generic]').prop('checked', (localStorage['import_generic'] == 'true'));
        }
        if (localStorage['import_personal']) {
            $('input[name=personal]').prop('checked', (localStorage['import_personal'] == 'true'));
        }
        if (localStorage['import_others']) {
            $('input[name=others]').prop('checked', (localStorage['import_others'] == 'true'));
        }
        if (localStorage['import_profilesOnly']) {
            $('#profilesOnly').prop('checked', (localStorage['import_profilesOnly'] == 'true'));
        }
    } else {
        localStorage['import_contactsByDomain'] = $('#contactsByDomain').val();

        localStorage['import_profilesOnly'] = $('#profilesOnly').prop('checked');
        localStorage['import_generic'] = $('input[name=generic]').prop('checked');
        localStorage['import_personal'] = $('input[name=personal]').prop('checked');
        localStorage['import_others'] = $('input[name=others]').prop('checked');

        checkCountsByDomains();
    }
}

function renderDomains(domains) {
    $domainEmails.empty();

    if (!+localStorage['googleDescr']) {
        $domainEmails.append($('#descr'));
        $('#descr').on('click', () => {
            localStorage['googleDescr'] = +$('#neverShow').prop('checked');
        });
    }

    for (var iNo = 0; iNo < domains.length; iNo++) {
        var $item = $(emailItemTemplate);
        var $email = $item.find('.js-contact-email');
        $email.text(domains[iNo]);
        $item.attr('id', 'domain_' + iNo);

        $domainEmails.append($item);
    }
    $('#completeSearchTemplate').removeClass('hidden');

    $('#next_button').on('click', clickNextButton);
}

if (chrome.tabs) {
    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

        maDefaultListId = (localStorage[LS_LastPeopleListId]) ? localStorage[LS_LastPeopleListId] : 0;

        chrome.tabs.sendMessage(tab.id, { method: 'getInnerHTML' }, function (response) {
            if (response) {
                domains = getDomainsFromGoogleSearch(response.data);
                if (domains && (domains.length > 0)) {
                    renderDomains(domains);
                }
            } else {
                $(document.body).append('<div class="main-body contacts-table"><div class="alert alert-warning">Please try refreshing the page in your browser</div></div>');
                $('#companyInfoBody').addClass('hidden');
                $('.main-footer').addClass('hidden');
            }
        });

    });
}
