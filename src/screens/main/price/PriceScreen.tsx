import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
  AnimatedPrice, 
  PriceChange, 
  TimeSelector
} from '@/src/components/features/Price/Chart'
import ChartContainer from '@/src/components/features/Price/Chart/ChartContainer'
import ScreenLayout from '@/src/components/layout/ScreenLayout'
import LoadingIndicator from '@/src/components/ui/LoadingIndicator'
import { useBitcoinPriceData } from '@/src/hooks/wallet/useBitcoinPriceData'
import { useAppFonts } from '@/src/hooks/ui/useFonts'
import { useTimeframeSelector } from '@/src/hooks/ui/useTimeframeSelector'
import { TIME_PERIODS } from '@/src/config/price'

const PriceScreen = () => {
  // Load custom fonts using our modularized hook
  const [ fontsLoaded, _fontsError ] = useAppFonts()
  
  // Use our modularized timeframe selection hook
  const { 
    selectedPeriod, 
    isChangingPeriod,
    handlePeriodChange 
  } = useTimeframeSelector(TIME_PERIODS[0])
  
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
  } = useBitcoinPriceData(selectedPeriod)
  
  // Combined loading state
  const showLoading = !fontsLoaded || isLoading || isChangingPeriod
  
  // Show loading state while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator color="#00D782" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    )
  }
  
  return (
    <ScreenLayout>
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
      
      {/* Chart section with modularized ChartContainer */}
      <View style={styles.chartAreaContainer}>
        <ChartContainer
          isLoading={showLoading}
          error={error}
          chartData={chartData}
          timestamps={timestamps}
          labels={labels}
          timeframe={selectedPeriod}
          onRetry={() => handlePeriodChange({...selectedPeriod})}
        />
      </View>
      
      {/* Time selector section */}
      <TimeSelector 
        periods={TIME_PERIODS}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={handlePeriodChange}
      />
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  loadingContainer : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  loadingText : {
    fontFamily : 'Inter-Regular',
    marginTop  : 10,
    color      : '#666666',
  },
  priceContainer : {
    padding      : 20,
    alignItems   : 'center',
    marginTop    : 80, // Increased from 50 to move price down
    marginBottom : 10, // Add some space below the price
  },
  chartAreaContainer : {
    flex         : 1,
    marginTop    : 10, // Add a little space above chart
    marginBottom : 10, // Add a little space below chart
  },
})

export default PriceScreen 