const CURRENCY_MAP = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
};

// Regex to find: $100 or 100 USD
const AMOUNT_REGEX = /([$€£¥])\s?(\d+(?:[.,]\d{2})?)|(\d+(?:[.,]\d{2})?)\s?([A-Z]{3})/i;

// State management
let isButtonVisible = false;

/**
 * Safely removes the conversion button and resets state.
 */
function removeButton() {
  const oldBtn = document.getElementById('currency-converter-btn');
  if (oldBtn) {
    oldBtn.remove();
  }
  isButtonVisible = false;
}

document.addEventListener('mouseup', (event) => {
  // 1. Early exit if button is already visible or we clicked the button itself
  if (isButtonVisible || event.target.id === 'currency-converter-btn') return;

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    const match = selectedText.match(AMOUNT_REGEX);

    if (match) {
      let amount, currency;

      if (match[1]) { // Format: $100
        currency = CURRENCY_MAP[match[1]] || match[1];
        amount = parseFloat(match[2].replace(',', '.'));
      } else if (match[4]) { // Format: 100 USD
        amount = parseFloat(match[3].replace(',', '.'));
        currency = match[4].toUpperCase();
      }

      if (amount !== undefined && currency) {
        showConversionButton(event.pageX, event.pageY, amount, currency);
      }
    }
  }
});

async function showConversionButton(x, y, amount, currency) {
  removeButton();

  const btn = document.createElement('button');
  btn.id = 'currency-converter-btn';
  btn.innerText = `Convert ${amount} ${currency}`;
  btn.style.left = `${x + 10}px`;
  btn.style.top = `${y + 10}px`;

  btn.onclick = async () => {
    // Change button text to show loading state
    btn.innerText = 'Converting...';
    btn.disabled = true;

    chrome.storage.sync.get(['targetCurrency'], (result) => {
      const targetCurrency = result.targetCurrency || 'USD';

      chrome.runtime.sendMessage(
        {
          type: 'GET_EXCHANGE_RATE',
          data: { base: currency },
        },
        async (response) => {
          try {
            // 1. Create the container and elements directly
            const container = document.createElement('div');
            container.className = 'conversion-result';

            const textSpan = document.createElement('span');
            textSpan.className = 'result-text';

            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '&times;';

            container.appendChild(textSpan);
            container.appendChild(closeBtn);

            // 2. Set the content
            if (response && response.status === 'success') {
              const rates = response.rates;
              if (rates[targetCurrency]) {
                const convertedAmount = (amount * rates[targetCurrency]).toFixed(2);
                textSpan.innerText = `${amount} ${currency} ≈ ${convertedAmount} ${targetCurrency}`;
              } else {
                textSpan.innerText = `Error: ${targetCurrency} not found`;
              }
            } else {
              textSpan.innerText = `Error: ${response ? response.error : 'Unknown error'}`;
            }

            // 3. Hide the button and place result in its position
            const rect = btn.getBoundingClientRect();
            btn.style.display = 'none';
            document.body.appendChild(container);
            container.style.left = `${rect.left}px`;
            container.style.top = `${rect.top}px`;

            // 4. Implement closing logic
            const closeResult = () => {
              container.remove();
              removeButton();
            };

            closeBtn.onclick = (e) => {
              e.stopPropagation();
              closeResult();
            };

            // Close on click outside
            const outsideClickListener = (event) => {
              if (!container.contains(event.target)) {
                closeResult();
                document.removeEventListener('mousedown', outsideClickListener);
              }
            };
            document.addEventListener('mousedown', outsideClickListener);

          } catch (err) {
            console.error('Error creating result UI:', err);
          }
        }
      );
    });
  };

  document.body.appendChild(btn);
  isButtonVisible = true;

  // Auto-remove button if not clicked within 3 seconds
  setTimeout(() => {
    if (isButtonVisible) {
      removeButton();
    }
  }, 3000);
}
