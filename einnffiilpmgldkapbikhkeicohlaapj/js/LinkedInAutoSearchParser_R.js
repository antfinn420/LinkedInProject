function getPeopleList_R(source) {
    var result = [];

    if (source && source.result && source.result.searchResults) {
        searchResults = source.result.searchResults;

        for (var iNo = 0; iNo < searchResults.length; iNo++) {
            if (searchResults[iNo].memberId && searchResults[iNo].authToken) {

                var person = {};
                person.searchLink = 'https://www.linkedin.com/recruiter/profile/' + searchResults[iNo].memberId + ',' + searchResults[iNo].authToken + ',CAP';
                person.source_id = searchResults[iNo].memberId;
                person.name = searchResults[iNo].fullName;
                person.source = 'linkedIn';
                result.push(person);
            }
        }

    }
    return result;
}
