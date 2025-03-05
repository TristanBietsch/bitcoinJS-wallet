/**
 * Bitcoin Price Screen
 * Displays real-time Bitcoin price with interactive chart and time period selector
 */
import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AnimatedPrice from '@/components/domain/Price/AnimatedPrice';
import BitcoinChart from '@/components/domain/Price/BitcoinChart';
import PriceChange from '@/components/domain/Price/PriceChange';
import TimeSelector from '@/components/domain/Price/TimeSelector';
import { ThemedView } from '@/components/common/ThemedView';
import { ThemedText } from '@/components/common/ThemedText';
import { useBitcoinPrice } from '@/hooks/useBitcoinPrice';

/**
 * Bitcoin Price Screen Component
 * Main screen for displaying Bitcoin price data and chart
 */
export default function PriceScreen() {
  const {
    currentPrice,
    previousPrice,
    priceChangePercent,
    chartData,
    timestamps,
    labels,
    isLoading,
    error,
    refresh,
    timeframe,
    setTimeframe,
    timeframes
  } = useBitcoinPrice();

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        <View style={styles.header}>
          <ThemedText style={styles.title}>Bitcoin Price</ThemedText>
        </View>

        <View style={styles.priceContainer}>
          <AnimatedPrice price={currentPrice} previousPrice={previousPrice} />
          <PriceChange 
            changePercent={priceChangePercent} 
            timeframe={timeframe} 
          />
        </View>

        <TimeSelector 
          periods={timeframes} 
          selectedPeriod={timeframe} 
          onSelectPeriod={setTimeframe} 
        />

        {error ? (
          <ThemedText style={styles.error}>{error}</ThemedText>
        ) : (
          <BitcoinChart 
            data={chartData} 
            timestamps={timestamps} 
            labels={labels}
            timeframe={timeframe}
            error={!!error}
          />
        )}
      </ScrollView>
    </ThemedView>
  );
}

/**
 * Styles for the Bitcoin Price Screen
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
}); 