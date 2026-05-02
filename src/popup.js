document.addEventListener('DOMContentLoaded', () => {
  const targetCurrencySelect = document.getElementById('target-currency');
  const saveButton = document.getElementById('save-settings');
  const statusText = document.getElementById('status');

  // Load saved currency
  chrome.storage.sync.get(['targetCurrency'], (result) => {
    if (result.targetCurrency) {
      targetCurrencySelect.value = result.targetCurrency;
    }
  });

  // Save settings
  saveButton.addEventListener('click', () => {
    const selectedCurrency = targetCurrencySelect.value;
    chrome.storage.sync.set({ targetCurrency: selectedCurrency }, () => {
      statusText.textContent = 'Settings saved!';
      statusText.style.color = 'green';
      setTimeout(() => {
        statusText.textContent = '';
      }, 2000);
    });
  });
});