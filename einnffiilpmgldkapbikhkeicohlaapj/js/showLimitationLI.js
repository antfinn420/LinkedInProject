if (chrome.tabs) {
    chrome.tabs.getSelected(null, function (tab) {
        addHeader();

        $(document.body).append('<div class="main-body contacts-table" id="message"><div class="alert alert-danger">' +
            "You've approached the daily limit of profile views. If you continue using Snovio extension on LinkedIn pages your LinkedIn account may be blocked." +
            '</div>' +

            'Please note that each profile saved from LinkedIn with Snovio is also a profile view.<br>' +
            '<br>Here are LinkedIn limits:<br>' +
            ' - 150* leads per day for a Free LinkedIn account<br>' +
            ' - 550* leads per day for a Premium LinkedIn account with the Regular search<br>' +
            ' - 1550* leads per day for Sales Navigator search<br>' +
            '(*these numbers are an approximation)<br><br>' +
            '</div>');

        chrome.storage.local.get('liAccounts', function (result) {
            if (result) {
                var resultString = '';

                var curDate = (new Date().setHours(0, 0, 0, 0)).toString();

                if (result[keyLi] && result[keyLi][curDate]) {
                    resultString += '<table width="350px" border="1" frame="hsides" bordercolor="silver">';
                    resultString += '<tr>';
                    resultString += '<th>Account</th>';
                    resultString += '<th>Used</th>';
                    resultString += '</tr>';

                    var list = result[keyLi][curDate];
                    for (var key in list) {
                        if (list[key].acDefCount > 0) {
                            resultString += '<tr>';
                            resultString += '<td>' + key + '</td>';

                            var max = 0;
                            (list[key].acPaid) ? max = 550 : max = 150;

                                                        if (list[key].acDefCountWarning) {
                                resultString += '<td style="color:red">' + list[key].acDefCount + '/' + max + '</td>';
                            } else {
                                resultString += '<td>' + list[key].acDefCount + '/' + max + '</td>';
                            }
                            resultString += '</tr>';
                        }
                        if (list[key].acSalesCount > 0) {
                            resultString += '<tr>';
                            resultString += '<td>' + key + ' (Sales Navigator)</td>';
                            if (list[key].acSalesCountWarning) {
                                resultString += '<td style="color:red">' + list[key].acSalesCount + '/1550</td>';
                            } else {
                                resultString += '<td>' + list[key].acSalesCount + '/1550</td>';
                            }
                            resultString += '</tr>';
                        }
                    }
                    resultString += '</table>';
                }

                resultString += '</div>';
                resultString += '<br><a href="#" style="font-size: 9pt;" id="ignoreButton">Continue anyway</a>';
                $('#message').append(resultString);

                $('#ignoreButton').on('click', () => {
                    chrome.storage.local.get('liAccounts', function (result) {
                        if (result) {
                            var curDate = (new Date().setHours(0, 0, 0, 0)).toString();

                            if (result[keyLi] && result[keyLi][curDate]) {
                                for (var key in result[keyLi][curDate]) {
                                    if (result[keyLi][curDate][key].acDefCountWarning) {
                                        result[keyLi][curDate][key].acDefCountIgnore = true;
                                    }
                                    if (result[keyLi][curDate][key].acSalesCountWarning) {
                                        result[keyLi][curDate][key].acSalesCountIgnore = true;
                                    }
                                }
                            }

                            chrome.storage.local.set({ 'liAccounts': result[keyLi] }, function () {
                                void 0;
                                window.close();
                            });
                        }
                    });
                })
            }
        });

    });

}