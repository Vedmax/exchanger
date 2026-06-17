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
 * Helper to parse numeric strings with various separators.
 * Handles:
 * - 1,234.56 (US)
 * - 1.234,56 (EU)
 * - 1,000,000 (thousands separator)
 * - 950,000 (thousands separator)
 * - 1,23 (decimal)
 * 
 * @param {string} s - The numeric string to parse.
 * @returns {number} The parsed number.
 */
function parseAmount(s) {
  let amountStr = s.trim();
  if (!amountStr) return NaN;

  const lastComma = amountStr.lastIndexOf(',');
  const lastDot = amountStr.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      // Comma is decimal: 1.234,56 -> 1234.56
      amountStr = amountStr.replace(/\./g, '').replace(',', '.');
    } else {
      // Dot is decimal: 1,234.56 -> 1234.56
      amountStr = amountStr.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    const parts = amountStr.split(',');
    if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
      // 1,000,000 or 1,000 -> 1000000 or 1000
      amountStr = amountStr.replace(/,/g, '');
    } else {
      // 1,23 -> 1.23
      amountStr = amountStr.replace(',', '.');
    }
  } else if (lastDot !== -1) {
    const parts = amountStr.split('.');
    if (parts.length > 2) {
      amountStr = amountStr.replace(/\./g, '');
    }
  }

  return parseFloat(amountStr);
}

/**
 * Regex for "Direct notation":
 * 1. Symbol followed by amount (e.g., $100 or $950,000)
 * 2. Amount followed by ISO code (e.g., 100 USD or 950,000 VND)
 */
const DIRECT_AMOUNT_REGEX = /([$€£¥])\s?([\d,.]+)|([\d,.]+)\s?([A-Z]{3})/i;

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
      amount = parseAmount(directMatch[2]);
    } else if (directMatch[4]) { // Format: 100 USD
      amount = parseAmount(directMatch[3]);
      currency = directMatch[4].toUpperCase();
    }

    if (!isNaN(amount) && currency) {
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