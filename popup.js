const bg = chrome.extension.getBackgroundPage();

function updatePopupContent(urls) {
    const urlList = document.getElementById("urlList");
    urlList.innerHTML = "";

    if (urls.length == 0)
        urls = ["None"]
    urls.forEach(url => {
        const listItem = document.createElement("li");
        listItem.textContent = url;
        urlList.appendChild(listItem);
    });
}

// Retrieve selected URLs for the current tab
function retrieveFilteredUrls() {
    chrome.tabs.query({ active: true, currentWindow: true },
                      function(tabs) {
                          console.log("current tab query result", tabs)
                          let tabId = tabs[0].id
                          const urls = (tabId in bg.filteredUrls) ?
                                bg.filteredUrls[tabId] : []
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
