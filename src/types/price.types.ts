/**
 * Type definitions for Bitcoin price-related components
 */

export interface TimeframePeriod {
  label: string;
  days: number | 'max';
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface PriceData {
  currentPrice: number | null;
  previousPrice: number | null;
  priceChangePercent: number | null;
  chartData: number[];
  timestamps: number[];
  labels: string[];
  isLoading: boolean;
  error: string | null;
}

export interface ChartDataResponse {
  prices?: [number, number][];
}

export interface AnimatedPriceProps {
  price: number | null;
  previousPrice: number | null;
}

export interface PriceChangeProps {
  changePercent: number | null;
  timeframe: TimeframePeriod;
}

export interface TimeSelectorProps {
  periods: TimeframePeriod[];
  selectedPeriod: TimeframePeriod;
  onSelectPeriod: (period: TimeframePeriod) => void;
}

export interface BitcoinChartProps {
  data: number[];
  timestamps: number[];
  labels: string[];
  timeframe: TimeframePeriod;
  error?: boolean; // Optional error flag to show error toast
} 