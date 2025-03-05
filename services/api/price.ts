/**
 * API functions for Bitcoin price data
 */
import { TimeframePeriod, ChartDataResponse } from '@/types/price.types';
import { EARLIEST_BITCOIN_TIMESTAMP } from '@/config/price';

/**
 * Fetches current Bitcoin price from CoinGecko
 */
export const fetchCurrentPrice = async (): Promise<number> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
  );
  
  if (!response.ok) {
    throw new Error(`API responded with status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.bitcoin || data.bitcoin.usd === undefined) {
    throw new Error('Invalid price data format from API');
  }
  
  return data.bitcoin.usd;
};

/**
 * Fetches historical Bitcoin price data from CoinGecko
 */
export const fetchHistoricalPrices = async (timeframe: TimeframePeriod): Promise<ChartDataResponse> => {
  const nowTimestamp = Math.floor(Date.now() / 1000);
  let fromTimestamp = nowTimestamp;
  
  if (timeframe.days === 'max') {
    fromTimestamp = EARLIEST_BITCOIN_TIMESTAMP; // Bitcoin's earliest data on CoinGecko
  } else {
    fromTimestamp = nowTimestamp - (timeframe.days * 24 * 60 * 60);
  }
  
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTimestamp}&to=${nowTimestamp}`
  );
  
  if (!response.ok) {
    throw new Error(`History API responded with status: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data || !data.prices || !Array.isArray(data.prices)) {
    throw new Error('Invalid history data format from API');
  }
  
  return data;
}; 