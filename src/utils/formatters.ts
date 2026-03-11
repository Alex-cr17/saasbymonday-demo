import type { CurrencyParams, FileParams, FormatterFunctions, MillionParams, PercentageParams, DateParams } from '@/types/formatters'
import dayjs from 'dayjs';

/**
 * Get initials from a name string
 * "John Doe" → "JD"
 */
export function getInitials(str?: string): string {
  if (!str) return 'U';
  return str.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
}

export const formatters: FormatterFunctions = {
  currency: ({ number, maxFractionDigits = 2, currency = 'USD' }: CurrencyParams): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: maxFractionDigits })
      .format(number)
  },

  unit: (number: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'decimal' })
      .format(number)
  },

  percentage: ({ number, minimumFractionDigits, maximumFractionDigits}: PercentageParams): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits,
      maximumFractionDigits
    }).format(number * 0.01); //we get 63.4907577663796, but we want 63,49%
  },

  million: ({ number, decimals = 1 }: MillionParams): string => {
    return `${new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      .format(number)}M`
  },

  date: ({ date }: DateParams): string => {
    const parsedDate = dayjs(date).toDate();

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(parsedDate)
  },

  fileSize: ({ size }: FileParams): string => {
    if (!size) return '';

    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
  }
}