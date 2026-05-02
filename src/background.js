// Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Extension Installed');
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_EXCHANGE_RATE') {
    const baseCurrency = message.data.base || 'USD';
    console.log('Received request for exchange rate for base:', baseCurrency);

    fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`)
      .then(response => response.json())
      .then(data => {
        if (data.result === 'success') {
          sendResponse({ status: 'success', rates: data.rates });
        } else {
          sendResponse({ status: 'error', error: 'Failed to fetch rates' });
        }
      })
      .catch(error => {
        console.error('Error fetching exchange rates:', error);
        sendResponse({ status: 'error', error: error.message });
      });

    return true; // Keep channel open for async response
  }
});
