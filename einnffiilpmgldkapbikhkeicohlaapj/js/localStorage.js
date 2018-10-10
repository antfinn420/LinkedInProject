class peoplesCache {
    get constPeopleCache() {
        return 'peopleCache';
    }

    loadFromStorage() {
        if (localStorage[this.constPeopleCache]) {
            this.cache = JSON.parse(localStorage[this.constPeopleCache]);

            if (this.cache.sourceIds) {
                for (var key in this.cache.sourceIds) {
                    var tmpIds = this.cache.sourceIds[key];
                    for (var iNo = 0; iNo < tmpIds.length; iNo++) {
                        this.pplSourceIDs.push(tmpIds[iNo]);
                    }
                }
            }

            if (this.cache.sourceIds_2) {
                for (var key in this.cache.sourceIds_2) {
                    var tmpIds = this.cache.sourceIds_2[key];
                    for (var iNo = 0; iNo < tmpIds.length; iNo++) {
                        this.pplSourceIDs_2.push(tmpIds[iNo]);
                    }
                }
            }
        }
    }

    saveToStorage() {
        localStorage[this.constPeopleCache] = JSON.stringify(this.cache);
    }

    checkSourceIdInCache(id) {
        return (this.pplSourceIDs.indexOf(id) != -1);
    }

    checkSourceIdInCache_2(id) {
        return (this.pplSourceIDs_2.indexOf(id) != -1);
    }

    getCurrentDate() {
        return +(new Date().setHours(0, 0, 0, 0));
    }

    addSourceIdToCache(id) {
        if (!this.checkSourceIdInCache(id)) {
            var sToday = this.getCurrentDate().toString();

            if (!this.cache.sourceIds) {
                this.cache.sourceIds = {};
            }

            if (!this.cache.sourceIds[sToday]) {
                this.cache.sourceIds[sToday] = [];
            }

            this.cache.sourceIds[sToday].push(id);
            this.pplSourceIDs.push(id);
        }
    }

    addSourceIdToCache_2(id) {
        if (!this.checkSourceIdInCache_2(id)) {
            var sToday = this.getCurrentDate().toString();

            if (!this.cache.sourceIds_2) {
                this.cache.sourceIds_2 = {};
            }

            if (!this.cache.sourceIds_2[sToday]) {
                this.cache.sourceIds_2[sToday] = [];
            }

            this.cache.sourceIds_2[sToday].push(id);
            this.pplSourceIDs_2.push(id);
        }
    }

    deleteOldIds(daysCount) {
        var iLastDay = this.getCurrentDate() - daysCount * 86400000;

        for (var key in this.cache.sourceIds) {
            if (+key < iLastDay) {
                delete this.cache.sourceIds[key];
            }
        }

        for (var key in this.cache.sourceIds_2) {
            if (+key < iLastDay) {
                delete this.cache.sourceIds_2[key];
            }
        }

        this.saveToStorage();
    }

    constructor() {
        this.pplSourceIDs = [];
        this.pplSourceIDs_2 = [];
        this.cache = {};
        this.loadFromStorage();
    }
}
