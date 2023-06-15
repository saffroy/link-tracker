const bg = chrome.extension.getBackgroundPage();

function updatePopupContent(urls) {
    const urlList = document.getElementById("urlList");
    urlList.innerHTML = "";

    if (urls.length == 0)
        urls = ["None"]
    urls.forEach(url => {
        const listItem = document.createElement("li");
        const a = document.createElement("a")
        a.href = url
        a.appendChild(document.createTextNode(url))
        listItem.appendChild(a)
        urlList.appendChild(listItem);
    });
}

function onCurrentTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true },
                      (tabs) => callback(tabs[0]))
}

// Retrieve selected URLs for the current tab
function retrieveFilteredUrls() {
    onCurrentTab(function(tab) {
        const tabId = tab.id
        const urls = (tabId in bg.filteredUrls) ?
              Array.from(bg.filteredUrls[tabId]) : []
        console.log("popup render tab", tabId, "urls", urls)
        updatePopupContent(urls)
    })
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "updateUrls") {
        console.log("popup notified of change")
        retrieveFilteredUrls();
    }
});

// Trigger the initial retrieval of URLs
updatePopupContent([])
retrieveFilteredUrls();
