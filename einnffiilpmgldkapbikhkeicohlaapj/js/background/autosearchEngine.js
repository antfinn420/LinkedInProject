chrome.browserAction.setBadgeBackgroundColor({
    color: '#5bae61'
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {

        if (request && request.type) {
            switch (request.type) {

                case 'addTask':
                    taskManager.addTask(request);
                    sendResponse({
                        ok: true
                    });
                    break;

                case 'getTaskList':
                    sendResponse({
                        taskList: taskManager.taskList
                    });
                    break;

                case 'stopTask':
                    taskManager.stopTask(request.taskNo);
                    break;

                case 'getActiveTaskCount':
                    sendResponse({
                        activeTaskCount: taskManager.getActiveTasksCount()
                    });
            }
        }
    }
);

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId.length > 12) {
        var newURL = getMainHost() + '/prospects';
    } else {
        if (notificationId == 'NO_CREDITS') {
            var newURL = getMainHost() + '/pricing-plans';
        } else {
            var newURL = getMainHost() + '/prospects/list/' + notificationId;
        }
    }
    localStorage['needUpdateMA'] = '';
    chrome.tabs.create({
        url: newURL
    }, function (tab) {});
});

var taskManager = {
    taskList: [],

    addTask: function (task) {

        if (task.interface == INTERFACE_SN) {
            var newTask = new ParserSN(task);
        } else {
            var newTask = new ParserDefault(task);
        }

        newTask.onFinish = this.finish;
        newTask.onFinish = newTask.onFinish.bind(this);

        this.taskList.push(newTask);

        void 0;
        void 0;
        void 0;

        this.checkNextTask();
    },

    getActiveTasksCount: function () {
        var countActiveTasks = 0;
        for (iNo in this.taskList) {
            if (!this.taskList[iNo].isFinished) {
                countActiveTasks++;
            }
        }
        return countActiveTasks;
    },

    updateBadgetext: function () {
        var countActiveTasks = this.getActiveTasksCount();

        if (countActiveTasks == 0) {
            countActiveTasks = '';
        }
        chrome.browserAction.setBadgeText({
            'text': countActiveTasks.toString()
        });
    },

    checkNextTask: function () {
        if (this.taskList.length == 0) {
            return;
        }

        for (iNo in this.taskList) {
            if (this.taskList[iNo].isStarted) {
                break;
            }

            if (!this.taskList[iNo].isStarted && !this.taskList[iNo].isFinished) {
                this.startTask(this.taskList[iNo]);
                break;
            }
        }

        while (this.taskList.length > 30) {
            this.taskList.shift();
        }

        this.updateBadgetext();
    },

    stopTask: function (taskNo) {
        for (var iNo in this.taskList) {
            if (iNo == taskNo) {
                void 0;
                void 0;
                void 0;
                this.taskList[iNo].stop();
            }
        }
    },

    stopAllTasks: function () {
        void 0;
        for (var iNo in this.taskList) {
            if (!this.taskList[iNo].isFinished) {
                void 0;
                void 0;
                this.taskList[iNo].stop();
            }
        }
        void 0;
    },

    startTask: function (task) {
        void 0;
        void 0;
        void 0;

        task.start();
    },

    finish: function (task) {
        void 0;
        void 0;
        void 0;

        var message1 = 'Prospect collecting by parameters "' + task.searchFilters + '" is complete.';
        if (task.interface == INTERFACE_SN) {
            message1 = 'Sales Navigator prospect collecting by parameters "' + task.searchFilters + '" is complete.';
        }

        var message2 = task.allSendPeoplesCount + ' prospects have been added to "' + task.userListname + '".'
        if (task.allSendPeoplesCount == 1) {
            message2 = task.allSendPeoplesCount + ' prospect have been added to "' + task.userListname + '".'
        }

        if (task.dateStarted && (task.errorCode !== 8)) {
            chrome.notifications.create(task.maListId, {
                type: 'basic',
                iconUrl: '../img/48.png',
                title: 'Snovio Email Finder',
                message: message2,
                contextMessage: message1,
                buttons: [{
                    title: 'Go to list'
                }]
            }, (notificationId) => {});
        }

        if (task.errorCode == 8) {
            this.stopAllTasks();
        } else {
            this.checkNextTask();
        }
    },

}