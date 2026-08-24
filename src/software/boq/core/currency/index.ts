/**
 * EVLab BOQ - Currency Formatting & Config Engine
 */

import { CurrencyConfig, CurrencyCode } from '../../types';

export const CURRENCY_PRESETS: Record<CurrencyCode, CurrencyConfig> = {
  BDT: {
    code: 'BDT',
    symbol: '৳',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    decimalPlaces: 2,
    thousandSeparator: ' ',
    decimalSeparator: ',',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  SAR: {
    code: 'SAR',
    symbol: 'SAR ',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
  CUSTOM: {
    code: 'CUSTOM',
    symbol: '¤',
    decimalPlaces: 2,
    thousandSeparator: ',',
    decimalSeparator: '.',
  },
};

export function formatCurrency(
  amount: number,
  currency: CurrencyConfig = CURRENCY_PRESETS.BDT,
  overrideDecimals?: number
): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${currency.symbol}0.00`;
  }

  const decimals = overrideDecimals !== undefined ? overrideDecimals : currency.decimalPlaces;
  const fixed = Math.abs(amount).toFixed(decimals);
  const [integerPart, decimalPart] = fixed.split('.');

  // Format integer part with thousand separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);

  const formattedAmount = decimalPart !== undefined
    ? `${formattedInteger}${currency.decimalSeparator}${decimalPart}`
    : formattedInteger;

  const sign = amount < 0 ? '-' : '';
  return `${sign}${currency.symbol}${formattedAmount}`;
}

export function formatQuantity(qty: number, precision: number = 3): string {
  if (isNaN(qty) || qty === null || qty === undefined) {
    return '0';
  }
  return qty.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}
