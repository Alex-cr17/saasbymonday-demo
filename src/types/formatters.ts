export interface CurrencyParams {
  number: number;
  maxFractionDigits?: number;
  currency?: string;
}

export interface PercentageParams {
  number: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export interface MillionParams {
  number: number;
  decimals?: number;
}

export interface DateParams {
  date: string;
}

export interface FileParams {
  size: number;
}

export type FormatterFunctions = {
  currency: (params: CurrencyParams) => string;
  unit: (number: number) => string;
  percentage: (params: PercentageParams) => string;
  million: (params: MillionParams) => string;
  date: (date: DateParams) => string;
  fileSize: (params: FileParams) => string;
}
