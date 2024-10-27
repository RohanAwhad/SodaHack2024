// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "dataFromContent") {
        // Relay the message to popup.js if it's open
        chrome.runtime.sendMessage({ type: "dataToPopup", data: request.data });
    }
});