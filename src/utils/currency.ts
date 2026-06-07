/**
 * Currency Utilities
 * 
 * Handles currency formatting and conversion for the platform
 * Primary currency: Russian Rubles (RUB)
 */

export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'GBP';

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Russian Rubles',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollars',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euros',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pounds',
  },
};

/**
 * Format a number as a currency string
 * Default currency is RUB (Russian Rubles)
 * 
 * @param amount - The amount to format
 * @param currency - Currency code (default: RUB)
 * @param locale - Locale for formatting (default: ru-RU)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode = 'RUB',
  locale: string = 'ru-RU'
): string {
  const config = CURRENCY_CONFIGS[currency];

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);

    return formatted;
  } catch {
    // Fallback if Intl API is not available
    return `${config.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format a number as RUB currency specifically
 * Convenience function for common use case
 * 
 * @param amount - The amount to format
 * @returns Formatted RUB string
 */
export function formatRUB(amount: number): string {
  return formatCurrency(amount, 'RUB', 'ru-RU');
}

/**
 * Get currency symbol
 * 
 * @param currency - Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency: CurrencyCode = 'RUB'): string {
  return CURRENCY_CONFIGS[currency]?.symbol || currency;
}

/**
 * Get currency name
 * 
 * @param currency - Currency code
 * @returns Currency name
 */
export function getCurrencyName(currency: CurrencyCode = 'RUB'): string {
  return CURRENCY_CONFIGS[currency]?.name || currency;
}

/**
 * Parse currency string back to number
 * Removes currency symbols and formatting
 * 
 * @param formatted - Formatted currency string
 * @returns Parsed number
 */
export function parseCurrency(formatted: string): number {
  // Remove all non-numeric characters except decimal point and minus
  const cleaned = formatted.replace(/[^\d.,\-]/g, '').replace(/,/g, '.');
  return parseFloat(cleaned) || 0;
}

/**
 * Convert amount from one currency to another
 * Note: This uses a simplified exchange rate. For production, integrate with a real API
 * 
 * @param amount - Amount to convert
 * @param from - Source currency
 * @param to - Target currency
 * @param rates - Exchange rates map (optional, for custom rates)
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates?: Record<string, number>
): number {
  if (from === to) return amount;

  // Default exchange rates (these are example rates and should be updated from API)
  const defaultRates: Record<string, number> = {
    'RUB-USD': 0.011, // 1 RUB = 0.011 USD (example)
    'RUB-EUR': 0.010,
    'RUB-GBP': 0.0087,
    'USD-RUB': 91,
    'EUR-RUB': 100,
    'GBP-RUB': 115,
  };

  const rateKey = `${from}-${to}`;
  const rate = rates?.[rateKey] ?? defaultRates[rateKey];

  if (!rate) {
    console.warn(`No exchange rate found for ${from} to ${to}`);
    return amount;
  }

  return amount * rate;
}
