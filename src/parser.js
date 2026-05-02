/**
 * Map of currency symbols to ISO codes.
 */
const CURRENCY_MAP = {
  '$': 'USD',
  '€': 'EUR',
  '£': 'GBP',
  '¥': 'JPY',
};
// TODO: add more currencies from the api response

/**
 * Regex for "Direct notation":
 * 1. Symbol followed by amount (e.g., $100)
 * 2. Amount followed by ISO code (e.g., 100 USD)
 */
const DIRECT_AMOUNT_REGEX = /([$€£¥])\s?(\d+(?:[.,]\d{2})?)|(\d+(?:[.,]\d{2})?)\s?([A-Z]{3})/i;

/**
 * Parses a string to extract amount and currency.
 * 
 * @param {string} text - The text to parse.
 * @returns {{amount: number, currency: string}|null} An object containing the parsed data, or null if no match is found.
 */
function parseCurrencyText(text) {
  // 1. Try Direct notation (e.g., $100 or 100 USD)
  const directMatch = text.match(DIRECT_AMOUNT_REGEX);

  if (directMatch) {
    let amount, currency;

    if (directMatch[1]) { // Format: $100
      currency = CURRENCY_MAP[directMatch[1]] || directMatch[1];
      amount = parseFloat(directMatch[2].replace(',', '.'));
    } else if (directMatch[4]) { // Format: 100 USD
      amount = parseFloat(directMatch[3].replace(',', '.'));
      currency = directMatch[4].toUpperCase();
    }

    if (amount !== undefined && currency) {
      return { amount, currency };
    }
  }

  // TODO: Implement "Inverse notation" (e.g.,  100 €)
  // TODO: Implement parsing USD 100
  return null;
}

// Expose the parser to the global window object for content scripts
window.CurrencyParser = {
  parse: parseCurrencyText
};