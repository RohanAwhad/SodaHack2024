// background.js


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkIllegalActivity') {
    // Return true here to indicate that we will send the response asynchronously
    (async function() {
      try {
        const response = await fetch('https://faith.rohanawhad.com/api/v1/domain-research/illegal-activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ domain_name: message.domain_name, need_detailed_report: false })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        sendResponse({ success: true, data });  // Send response back to content script
      } catch (error) {
        console.error('Error checking illegal activity:', error);
        sendResponse({ success: false, error: error.message });
      }
    })(); // Immediately invoke the async function

    return true; // Keeps the messaging channel open for async responses
  }
});
