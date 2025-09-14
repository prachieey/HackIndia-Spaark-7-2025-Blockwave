const axios = require('axios');
const AppError = require('./appError');

// Supported currencies with their symbols and decimal places
const CURRENCIES = {
  USD: { symbol: '$', decimalPlaces: 2, name: 'US Dollar' },
  EUR: { symbol: '€', decimalPlaces: 2, name: 'Euro' },
  GBP: { symbol: '£', decimalPlaces: 2, name: 'British Pound' },
  JPY: { symbol: '¥', decimalPlaces: 0, name: 'Japanese Yen' },
  AUD: { symbol: 'A$', decimalPlaces: 2, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', decimalPlaces: 2, name: 'Canadian Dollar' },
  CHF: { symbol: 'CHF', decimalPlaces: 2, name: 'Swiss Franc' },
  CNY: { symbol: '¥', decimalPlaces: 2, name: 'Chinese Yuan' },
  INR: { symbol: '₹', decimalPlaces: 2, name: 'Indian Rupee' },
  // Add more currencies as needed
};

// Default currency
const DEFAULT_CURRENCY = 'INR';

// Cache for exchange rates
let exchangeRates = {
  timestamp: null,
  base: 'USD',
  rates: {
    USD: 1,
  },
};

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Format a currency amount
 * @param {number} amount - Amount to format
 * @param {string} [currencyCode=DEFAULT_CURRENCY] - ISO 4217 currency code
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.showSymbol=true] - Whether to show the currency symbol
 * @param {boolean} [options.useCodeIfNoSymbol=false] - Use currency code if no symbol is available
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY, options = {}) => {
  const {
    showSymbol = true,
    useCodeIfNoSymbol = false,
  } = options;
  
  // Ensure the currency code is uppercase
  const code = currencyCode.toUpperCase();
  
  // Get currency info or use defaults
  const currency = CURRENCIES[code] || {
    symbol: useCodeIfNoSymbol ? code : '$',
    decimalPlaces: 2,
  };
  
  // Format the number with the correct decimal places
  const formattedAmount = Number(amount).toFixed(currency.decimalPlaces);
  
  // Add thousand separators
  const parts = formattedAmount.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  const formattedNumber = parts.join('.');
  
  // Return the formatted string with or without symbol
  if (showSymbol) {
    return `${currency.symbol}${formattedNumber}`;
  }
  
  return formattedNumber;
};

/**
 * Convert an amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency code
 * @param {string} to - Target currency code
 * @returns {Promise<number>} - Converted amount
 */
const convertCurrency = async (amount, from, to) => {
  // If the currencies are the same, return the amount as is
  if (from.toUpperCase() === to.toUpperCase()) {
    return amount;
  }
  
  // Ensure we have fresh exchange rates
  await getExchangeRates();
  
  // Convert to USD first if needed
  let usdAmount = amount;
  if (from.toUpperCase() !== 'USD') {
    const fromRate = exchangeRates.rates[from.toUpperCase()];
    if (!fromRate) {
      throw new AppError(`Unsupported currency: ${from}`, 400);
    }
    usdAmount = amount / fromRate;
  }
  
  // Convert from USD to target currency
  if (to.toUpperCase() === 'USD') {
    return usdAmount;
  }
  
  const toRate = exchangeRates.rates[to.toUpperCase()];
  if (!toRate) {
    throw new AppError(`Unsupported currency: ${to}`, 400);
  }
  
  return usdAmount * toRate;
};

/**
 * Get the latest exchange rates
 * @returns {Promise<Object>} - Exchange rates
 */
const getExchangeRates = async () => {
  const now = Date.now();
  
  // Return cached rates if they're still fresh
  if (
    exchangeRates.timestamp &&
    now - exchangeRates.timestamp < CACHE_DURATION
  ) {
    return exchangeRates;
  }
  
  try {
    // In a real app, you would call an exchange rate API here
    // For example, using the ExchangeRate-API or a similar service
    // const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.EXCHANGE_RATE_API_KEY}`
    //   }
    // });
    
    // For demo purposes, we'll use a mock response
    const mockRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      JPY: 110.25,
      AUD: 1.35,
      CAD: 1.27,
      CHF: 0.92,
      CNY: 6.45,
      INR: 75.5,
    };
    
    exchangeRates = {
      timestamp: now,
      base: 'USD',
      rates: mockRates,
    };
    
    return exchangeRates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    
    // If we have old rates, return them as a fallback
    if (exchangeRates.rates) {
      return exchangeRates;
    }
    
    throw new AppError('Unable to fetch exchange rates', 503);
  }
};

/**
 * Get all supported currencies
 * @returns {Array} - List of supported currency codes
 */
const getSupportedCurrencies = () => {
  return Object.keys(CURRENCIES);
};

/**
 * Get currency information
 * @param {string} currencyCode - ISO 4217 currency code
 * @returns {Object} - Currency information
 */
const getCurrencyInfo = (currencyCode) => {
  const code = currencyCode.toUpperCase();
  const currency = CURRENCIES[code];
  
  if (!currency) {
    throw new AppError(`Unsupported currency: ${currencyCode}`, 400);
  }
  
  return {
    code,
    ...currency,
  };
};

/**
 * Parse a currency string to a number
 * @param {string} currencyString - Currency string to parse (e.g., "$1,234.56")
 * @param {string} [currencyCode] - Expected currency code (optional)
 * @returns {number} - Parsed number
 */
const parseCurrency = (currencyString, currencyCode) => {
  if (typeof currencyString !== 'string') {
    throw new AppError('Input must be a string', 400);
  }
  
  // Remove all non-numeric characters except decimal point
  const numericString = currencyString.replace(/[^0-9.-]+/g, '');
  
  const number = parseFloat(numericString);
  
  if (isNaN(number)) {
    throw new AppError('Invalid currency format', 400);
  }
  
  return number;
};

module.exports = {
  DEFAULT_CURRENCY,
  CURRENCIES,
  formatCurrency,
  convertCurrency,
  getExchangeRates,
  getSupportedCurrencies,
  getCurrencyInfo,
  parseCurrency,
};
