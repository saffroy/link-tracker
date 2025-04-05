// Regular expression for matching page URLs
const pageUrlRegexes = [
    /.*/,
]

const requestUrlRegexes = [
    /\.m3u8/i,
    /\.vtt/i,
    /\.mp3/i,
    /\.mp4/i,
]

function storageKey(tabId) {
    return `filteredUrls-${tabId}`
}

// Event listener for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "loading") {
        chrome.action.setBadgeBackgroundColor({
            tabId: tabId, color: "#F00000",
        })

        const matched = pageUrlRegexes.some(regex => regex.test(tab.url))
        if (!matched) {
            chrome.storage.session.remove(storageKey(tabId))
            chrome.action.setBadgeText({tabId: tabId, text: ""})
        } else {
            // Reset the filtered URLs for the tab
            console.log("matched tab", tabId, tab.url)
            chrome.storage.session.set({ [storageKey(tabId)]: [] })
            chrome.action.setBadgeText({tabId: tabId, text: "0"})
        }
    }
})

// Event listener for tab removal
chrome.tabs.onRemoved.addListener(function (tabId) {
    // Clean up the filtered URLs for the closed tab
    console.log("drop tab", tabId)
    chrome.storage.session.remove(storageKey(tabId))
})

// Event listener for new requests *in all tabs*
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const tabId = details.tabId
	const key = storageKey(tabId)

        chrome.storage.session.get([key]).then(result => {
            const currentUrls = result[key] || []
            const url = details.url
            const matched = requestUrlRegexes.some(regex => regex.test(url))

            if (matched && !currentUrls.includes(url)) {
                // Store the request URL in the filtered URLs array
                console.log("matched ressource", url, details)
                const updatedUrls = [...currentUrls, url]

                chrome.storage.session.set({ [key]: updatedUrls })
                chrome.action.setBadgeText({
                    tabId: tabId,
                    text: String(updatedUrls.length)
                })
            }
        })
    },
    {urls: ["<all_urls>"]},
    []
)
