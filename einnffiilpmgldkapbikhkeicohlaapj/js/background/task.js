'use strict';

class TaskLI {
    constructor() {
        this.isStarted = false;
        this.isFinished = false;
        this.dateCreated = +Date.now();
        this.dateStarted = undefined;
        this.dateStopped = undefined;
    }

    start() {
        this.isStarted = true;
        this.dateStarted = +Date.now();
    }

    stop() {
        this.isStarted = false;
        this.dateStopped = +Date.now();
        this.isFinished = true;
        if (this.onFinish) {
            this.onFinish(this);
        }
    }

    onFinish() {
        void 0;
    }
}