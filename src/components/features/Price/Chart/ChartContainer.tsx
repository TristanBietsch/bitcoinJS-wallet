/**
 * Container component for Bitcoin price chart with loading and error handling
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { BitcoinChart } from '@/src/components/features/Price/Chart'
import LoadingIndicator from '@/src/components/ui/LoadingIndicator'
import ErrorDisplay from '@/src/components/ui/ErrorDisplay'
import { TimeframePeriod } from '@/src/types/price.types'

interface ChartContainerProps {
  isLoading: boolean
  error: string | null
  chartData: number[]
  timestamps: number[]
  labels: string[]
  timeframe: TimeframePeriod
  onRetry: () => void
}

/**
 * Container component for Bitcoin price chart with loading and error states
 */
const ChartContainer: React.FC<ChartContainerProps> = ({
  isLoading,
  error,
  chartData,
  timestamps,
  labels,
  timeframe,
  onRetry
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingIndicator 
          size="large" 
          color="#00D782" 
          style={styles.loader}
        />
      </View>
    )
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <ErrorDisplay 
          error={error} 
          onRetry={onRetry}
          retryText="Retry"
        />
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <BitcoinChart 
        data={chartData} 
        timestamps={timestamps}
        labels={labels}
        timeframe={timeframe}
        error={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex           : 1,
    justifyContent : 'center',
  },
  loader : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
  }
})

export default ChartContainer 