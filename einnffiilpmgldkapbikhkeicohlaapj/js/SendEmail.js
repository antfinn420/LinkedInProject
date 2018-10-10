const cTemplates = 'sentTemplates';
var arrTemplates;

$('#mailTo').text('Recipients: ' + localStorage['emailsForSend'].replace(/,/g, ', '));

function sendEmail() {
    var subject = $('#mailSubject').val();
    if (subject.trim() == '') {
        setTimeout(function () {
            $('#sendEmail').removeClass('active');
            $('#mailSubject').focus();
         }, 50);
        return;
    }
    var content = $('#mailBody').val();
    if (content.trim() == '') {
        setTimeout(function () {
            $('#sendEmail').removeClass('active');
            $('#mailBody').focus();
         }, 50);
        return;
    }

    addTemplate(subject, content);
    saveTemplates();

    var objEmail = {};
    objEmail.to = localStorage['emailsForSend'].split(',');
    objEmail.subject = subject;
    objEmail.body = content;
    $.post(getMainHost() + '/api/sendEmail', objEmail, function (response) {
        $('#sendBlock').addClass('hidden');

        if (response.result) {
            $('#successBlock').removeClass('hidden');
            $('#sendBlock').addClass('hidden');
        } else {
            if (response.code && (response.code > 0)) {
                showSmtpError(response.message);
            }
        }
        void 0;
    });
}

function showSmtpError(message) {
    localStorage['isSmtpConfigured'] = 0;

    $('#errorBlock').removeClass('hidden');
    $('#sendBlock').addClass('hidden');
    document.getElementById('smtpError').innerHTML = message;
}

function saveTemplates() {
    if (arrTemplates) {
        localStorage[cTemplates] = JSON.stringify(arrTemplates);
    }
}

function loadTemplates() {
    if (localStorage[cTemplates]) {
        arrTemplates = JSON.parse(localStorage[cTemplates]);
    }
}

function showTemplates() {
    if (arrTemplates && (arrTemplates.length > 0)) {
        var $templates = $('#savedTemplates');
        $templates.removeClass('hidden');
        $('#savedTemplates_label').removeClass('hidden');
        for (var iNo = 0; iNo < arrTemplates.length; iNo++) {
            if (arrTemplates[iNo]) {
                var option = document.createElement('option');
                option.text = arrTemplates[iNo].subject + ' (' + (new Date(+arrTemplates[iNo].date)).toLocaleDateString() + ')';
                option.value = iNo;
                $templates.append(option);
            }
        }
        $templates.prop('selectedIndex', -1);
        $templates.change(function () {
            iNo = $templates.val();
            $('#mailSubject').val(arrTemplates[iNo].subject);
            $('#mailBody').val(arrTemplates[iNo].content);
        });
    }
}

function addTemplate(subject, content) {
    if (!arrTemplates) {
        arrTemplates = [];
    }
    var hash = md5(subject + content);
    for (var iNo = 0; iNo < arrTemplates.length; iNo++) {
        if (arrTemplates[iNo] && arrTemplates[iNo].hash) {
            if (arrTemplates[iNo].hash == hash) {
                arrTemplates.splice(iNo, 1);
                break;
            }
        }
    }

    var objNewTemplate = {};
    objNewTemplate.subject = subject;
    objNewTemplate.content = content;
    objNewTemplate.date = (+(new Date().setHours(0, 0, 0, 0))).toString();
    objNewTemplate.hash = hash;

    arrTemplates.unshift(objNewTemplate);
}

chrome.tabs.getSelected(null, function (tab) {
    var isSmtpConfigured = localStorage['isSmtpConfigured'];
    if (!isSmtpConfigured || (isSmtpConfigured == '0')) {
        $.post(getMainHost() + '/api/checkSendEmail', '', function (response) {
            void 0;
            if (!response || !response.result) {
                showSmtpError(response.message);
            }
        });
    }
    $('#sendEmail').on('click', sendEmail);
    $('#btnBack').on('click', function () {
        window.location.href = "../html/Popup.html";
    });
    $('#btnBack2').on('click', function () {
        window.location.href = "../html/Popup.html";
    });
    $('#btnBack3').on('click', function () {
        window.location.href = "../html/Popup.html";
    });
    loadTemplates();
    showTemplates();
});