chrome.tabs.getSelected(null, function (tab) {
    addHeader();

    chrome.runtime.sendMessage({
        type: 'getTaskList'
    }, function (response) {
        if (response && response.taskList && (response.taskList.length > 0)) {
            for (var iNo = response.taskList.length - 1; iNo >= 0; iNo--) {
                var progress = '' +
                    '<div style="font-size: 11px;">Search parameters: ' + response.taskList[iNo].searchFilters + '</div>' +
                    '<span style="font-size: 11px;">List name: ' + response.taskList[iNo].userListname + '</span>';
                if (response.taskList[iNo].isStarted) {
                    progress = progress + '<a style="font-size: 11px; float:right; cursor: pointer;" id="stopTask' + iNo + '">Stop task</a>';
                } else {
                    progress = progress + '<a class="hidden" style="font-size: 11px; float:right; cursor: pointer;" id="stopTask' + iNo + '">Stop task</a>';
                }

                progress = progress +
                    '<div class="progress" style="margin-bottom: 15px;">' +
                    '   <div class="progress-bar" style="width:0%" id="progressStatus' + iNo + '">0%</div>' +
                    '</div>';

                $('#task_list').append('<div>' + progress + '</div>');
                changeProgresStatus(response.taskList[iNo], iNo);

                $('#stopTask' + iNo).click(function (e) {
                    var $link = $(e.target);
                    void 0;
                    void 0;
                    var taskNo = findDescrByRegEx($link[0].id, /(\d+)/i);
                    void 0;

                    chrome.runtime.sendMessage({
                        type: 'stopTask',
                        taskNo: taskNo
                    });
                });
            }
            setTimeout(updateProgress, 1000);
        } else {
            $('#title').text('Task list is empty');
        }
    });
})

function updateProgress() {
    chrome.runtime.sendMessage({
        type: 'getTaskList'
    }, function (response) {
        if (response && response.taskList) {
            for (var iNo in response.taskList) {
                changeProgresStatus(response.taskList[iNo], iNo);
            }
            setTimeout(updateProgress, 1000);
        }
    });
}

function changeProgresStatus(task, iNo) {
    $progress = $('#progressStatus' + iNo);

    var percentsUsed = 0.00;
    if (task.pageCurrent > 1) {
        percentsUsed = ((100 / (task.pageFinish - task.pageStart + 1)) * (task.pageCurrent - task.pageStart));
    }

    percentsUsed = (percentsUsed + ((100 / (task.pageFinish - task.pageStart + 1) / (task.people.length + 2)) * task.profilesProcessed));

    percentsUsed = percentsUsed.toFixed(2);
    if (percentsUsed == 100) {
        percentsUsed = 100;
    }

    $progress.css('width', percentsUsed + '%');
    if (task.allSendPeoplesCount > 0) {
        $progress.text(percentsUsed + '%: ' + task.allSendPeoplesCount + ' prospects found, ' + (task.pageCurrent - task.pageStart) + '/' + (task.pageFinish - task.pageStart + 1) + ' search pages processed');
    } else {
        $progress.text(percentsUsed);
    }

    if (task.isStarted && !task.isFinished) {
        $progress.removeClass('progress-bar-success');
        $progress.addClass('progress-bar-striped active');
        $('#stopTask' + iNo).removeClass('hidden');
    } else {
        $progress.removeClass('progress-bar-striped active');
        $('#stopTask' + iNo).addClass('hidden');
        if (task.error) {
            if ((task.allSendPeoplesCount > 0) && (task.errorCode !== 8) && (task.errorCode !== 999)) {
                $progress.addClass('progress-bar-warning');
            } else {
                $progress.addClass('progress-bar-danger');
                if (task.errorCode == 8) {
                    $progress.text(percentsUsed + '%: ' + task.allSendPeoplesCount + ' prospects found. Not enough credits in your account.');
                }
                if (task.errorCode == 999) {
                    $progress.text(percentsUsed + '%: ' + task.allSendPeoplesCount + ' prospects found. Can not access linkedin account.');
                }
            }
        } else {
            $progress.addClass('progress-bar-success');
            if ((percentsUsed < 100) && task.isFinished) {
                $progress.addClass('progress-bar-warning');
            }
        }
    }

}