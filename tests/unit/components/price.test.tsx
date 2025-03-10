import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PriceScreen from '@/screens/main/PriceScreen';
import { useBitcoinPriceData } from '@/hooks/wallet/useBitcoinPriceData';
import { TIME_PERIODS } from '@/config/price';
import { TimeframePeriod } from '@/types/price.types';

// Mock the hooks
jest.mock('@/hooks/wallet/useBitcoinPriceData');
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

// Mock the Price components
jest.mock('@/components/domain/Price', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  
  return {
    AnimatedPrice: () => (
      <View testID="animated-price">
        <Text>$50,000</Text>
      </View>
    ),
    BitcoinChart: () => (
      <View testID="bitcoin-chart">
        <Text>Chart Component</Text>
      </View>
    ),
    PriceChange: () => (
      <View testID="price-change">
        <Text>+5.2%</Text>
      </View>
    ),
    TimeSelector: ({ periods, selectedPeriod, onSelectPeriod }: {
      periods: TimeframePeriod[];
      selectedPeriod: TimeframePeriod;
      onSelectPeriod: (period: TimeframePeriod) => void;
    }) => (
      <View testID="time-selector">
        {periods.map((period) => (
          <TouchableOpacity
            key={period.label}
            testID={`time-selector-${period.label}`}
            onPress={() => onSelectPeriod(period)}
          >
            <Text>{period.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    ),
  };
});

// Mock price data
const mockPriceData = {
  currentPrice: 50000,
  previousPrice: 47500,
  priceChangePercent: 5.2,
  chartData: [45000, 46000, 47000, 48000, 50000],
  timestamps: ['2024-01-01', '2024-01-02', '2024-01-03', '2024-01-04', '2024-01-05'],
  labels: ['Jan 1', 'Jan 2', 'Jan 3', 'Jan 4', 'Jan 5'],
  isLoading: false,
  error: null,
};

describe('PriceScreen', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the hook to return our test data
    (useBitcoinPriceData as jest.Mock).mockReturnValue(mockPriceData);
  });

  it('renders without crashing', () => {
    const { getByTestId } = render(<PriceScreen />);
    
    expect(getByTestId('animated-price')).toBeTruthy();
    expect(getByTestId('bitcoin-chart')).toBeTruthy();
    expect(getByTestId('price-change')).toBeTruthy();
    expect(getByTestId('time-selector')).toBeTruthy();
  });

  it('shows loading state when data is loading', () => {
    (useBitcoinPriceData as jest.Mock).mockReturnValue({
      ...mockPriceData,
      isLoading: true,
    });
    
    const { getByText } = render(<PriceScreen />);
    expect(getByText('Loading chart data...')).toBeTruthy();
  });

  it('shows error message when there is an error', () => {
    (useBitcoinPriceData as jest.Mock).mockReturnValue({
      ...mockPriceData,
      error: 'Failed to fetch data',
    });
    
    const { getByText } = render(<PriceScreen />);
    expect(getByText('Failed to fetch data')).toBeTruthy();
  });

  it('handles period change correctly', async () => {
    const { getByTestId } = render(<PriceScreen />);
    
    // Find and press the week button
    const weekButton = getByTestId('time-selector-1w');
    fireEvent.press(weekButton);
    
    // Wait for the hook to be called with the new period
    await waitFor(() => {
      expect(useBitcoinPriceData).toHaveBeenCalledWith(TIME_PERIODS[1]);
    }, { timeout: 1000 });
  });

  it('shows retry button when there is an error', () => {
    (useBitcoinPriceData as jest.Mock).mockReturnValue({
      ...mockPriceData,
      error: 'Failed to fetch data',
    });
    
    const { getByText } = render(<PriceScreen />);
    expect(getByText('Retry')).toBeTruthy();
  });
}); 