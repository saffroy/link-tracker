// Regular expression for matching page URLs
const pageUrlRegexes = [
    /^https:\/\/(www.?\.)?nhk\.or\.jp\/.*\/ondemand\/video\/.*/,
    /arte\.tv\/.*\/videos\//,
    /.*/,
]

const requestUrlRegexes = [
    /\.m3u8/,
    /\.vtt/,
]

// Store the filtered URLs for each tab
const filteredUrls = {}; // tabId -> [String]

// Make them readable from popup via background page
window.filteredUrls = filteredUrls

function notifyPopup() {
    console.log("notifying popup of change")
    chrome.runtime.sendMessage({ action: "updateUrls" });
}

// Event listener for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {
        const matched = pageUrlRegexes.some(regex => regex.test(tab.url))
        if (!matched) {
            delete filteredUrls[tabId];
            chrome.browserAction.disable(tabId)
        } else {
            // Reset the filtered URLs for the tab
            console.log("matched tab", tabId, tab.url)
            filteredUrls[tabId] = [];
            chrome.browserAction.enable(tabId)
        }
    }
});

// Event listener for tab removal
chrome.tabs.onRemoved.addListener(function (tabId) {
    // Clean up the filtered URLs for the closed tab
    console.log("drop tab", tabId)
    delete filteredUrls[tabId];
    notifyPopup()
});

// Event listener for completed requests *in all tabs*
chrome.webRequest.onCompleted.addListener(
    function(details) {
        const tabId = details.tabId

        if (tabId in filteredUrls) {
            const url = details.url
            const matched = requestUrlRegexes.some(regex => regex.test(url) )
            if (matched) {
                // Store the request URL in the filtered URLs array
                console.log("matched ressource", url, details)
                filteredUrls[tabId].push(url);
                notifyPopup()
            }
        }
    },
    {urls: ["<all_urls>"]},
    []
);
