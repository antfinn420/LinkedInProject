chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == 'getInnerHTML') {
        sendResponse({data: document.all[0].innerHTML, method: 'getInnerHTML'});
    }
    if (request.method == 'getInnerHTML2') {
        sendResponse({data: document.all[0].innerHTML, data2: document.all[0].innerText, method: 'getInnerHTML2'});
    }
    if (request.method == 'getInnerText') {
        sendResponse({data: document.all[0].innerText, method: 'getInnerText'});
    }
    if (request.method == 'getContent') {
        sendResponse({data: 'content', method: 'getContent'});
    }
});
