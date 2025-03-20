/**
 * Bitcoin Price Screen
 * Displays real-time Bitcoin price with interactive chart and time period selector
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { 
  IBMPlexMono_400Regular, 
  IBMPlexMono_700Bold 
} from '@expo-google-fonts/ibm-plex-mono';

// Import all components from the price module
import {
  AnimatedPrice, 
  PriceChange, 
  TimeSelector, 
  BitcoinChart,
} from '@/src/components/domain/Price';
import { useBitcoinPriceData } from '@/src/hooks/wallet/useBitcoinPriceData';
import { TIME_PERIODS } from '@/src/config/price';
import { TimeframePeriod } from '@/src/types/price.types';

/**
 * Bitcoin Price Screen Component
 * Main screen for displaying Bitcoin price data and chart
 */
const PriceScreen = () => {
  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
    'IBMPlexMono-Regular': IBMPlexMono_400Regular,
    'IBMPlexMono-Bold': IBMPlexMono_700Bold,
  });
  
  // Add loading state handler to prevent rapid switching
  const [isChangingPeriod, setIsChangingPeriod] = useState(false);
  
  // State for selected time period
  const [selectedPeriod, setSelectedPeriod] = useState<TimeframePeriod>(TIME_PERIODS[0]);
  
  // Handler for period changes with debounce
  const handlePeriodChange = useCallback((period: TimeframePeriod) => {
    setIsChangingPeriod(true);
    setSelectedPeriod(period);
    
    // Reset changing state after a short delay
    setTimeout(() => {
      setIsChangingPeriod(false);
    }, 300);
  }, []);
  
  // Fetch Bitcoin data based on selected time period
  const { 
    currentPrice, 
    previousPrice,
    priceChangePercent,
    chartData, 
    timestamps,
    labels, 
    isLoading, 
    error 
  } = useBitcoinPriceData(selectedPeriod);
  
  // Combined loading state
  const showLoading = !fontsLoaded || isLoading || isChangingPeriod;
  
  // Show loading state while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D782" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Price display section */}
      <View style={styles.priceContainer}>
        <AnimatedPrice 
          price={currentPrice} 
          previousPrice={previousPrice} 
        />
        <PriceChange
          changePercent={priceChangePercent}
          timeframe={selectedPeriod}
        />
      </View>
      
      {/* Chart section */}
      <View style={styles.chartAreaContainer}>
        {showLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00D782" />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => handlePeriodChange({...selectedPeriod})}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <BitcoinChart 
            data={chartData} 
            timestamps={timestamps}
            labels={labels}
            timeframe={selectedPeriod}
            error={!!error}
          />
        )}
      </View>
      
      {/* Time selector section */}
      <TimeSelector 
        periods={TIME_PERIODS}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={handlePeriodChange}
      />
    </View>
  );
};

/**
 * Styles for the Bitcoin Price Screen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 100, // Add padding for bottom navigation
  },
  priceContainer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 80, // Increased from 50 to move price down
    marginBottom: 10, // Add some space below the price
  },
  chartAreaContainer: {
    flex: 1,
    marginTop: 10, // Add a little space above chart
    marginBottom: 10, // Add a little space below chart
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    marginTop: 10,
    color: '#666666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    color: '#FF4D4D',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00D782',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    fontFamily: 'Inter-Medium',
    color: 'white',
    fontWeight: '500',
  },
});

export default PriceScreen; 