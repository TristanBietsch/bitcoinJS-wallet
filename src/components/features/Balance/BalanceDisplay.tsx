import React, { ReactNode } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import LoadingIndicator from '@/src/components/ui/Feedback/LoadingIndicator'
import ErrorDisplay from '@/src/components/ui/Feedback/ErrorDisplay'
import { CurrencyType } from '@/src/config/currency'

interface BalanceDisplayProps {
  isLoading: boolean
  error?: string
  currency: CurrencyType
  formattedBalance: string
  fadeAnim: Animated.Value
  onRetry?: () => void
  currencySelector?: ReactNode // New prop for currency selector
}

/**
 * Reusable component for displaying wallet balance with loading and error states
 */
const BalanceDisplay = ({
  isLoading,
  error,
  currency,
  formattedBalance,
  fadeAnim,
  onRetry,
  currencySelector
}: BalanceDisplayProps) => {
  // Render the balance based on currency type
  const renderBalance = () => {
    if (currency === 'SATS') {
      return (
        <View style={styles.balanceRow}>
          <ThemedText style={styles.balanceAmount}>
            {formattedBalance}
          </ThemedText>
          <ThemedText style={styles.satsLabel}>
            Sats
          </ThemedText>
        </View>
      )
    } else {
      return (
        <ThemedText style={styles.balanceAmount}>
          {formattedBalance}
        </ThemedText>
      )
    }
  }

  return (
    <View style={styles.balanceContainer}>
      <ThemedText type="default" style={styles.balanceLabel}>
        Current Balance:
      </ThemedText>
      
      {isLoading ? (
        <LoadingIndicator style={styles.loader} />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={onRetry} />
      ) : (
        <>
          <Animated.View style={[ styles.balanceDisplayContainer, { opacity: fadeAnim } ]}>
            {renderBalance()}
          </Animated.View>
          
          {/* Render currency selector directly below balance */}
          {currencySelector && (
            <View style={styles.currencySelectorContainer}>
              {currencySelector}
            </View>
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  balanceContainer : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  balanceLabel : {
    fontSize     : 16,
    marginBottom : 8,
  },
  balanceAmount : {
    fontSize     : 48,
    fontWeight   : 'bold',
    marginBottom : 0, // Reduced to bring dropdown closer
  },
  balanceRow : {
    flexDirection : 'row',
    alignItems    : 'baseline',
  },
  satsLabel : {
    fontSize   : 24,
    fontWeight : 'normal',
    marginLeft : 6,
  },
  loader : {
    marginVertical : 20,
  },
  balanceDisplayContainer : {
    opacity        : 1,
    height         : 60, // Reduced to bring dropdown closer
    justifyContent : 'center',
    alignItems     : 'center',
  },
  currencySelectorContainer : {
    marginTop  : 10,
    width      : '100%',
    alignItems : 'center',
  }
})

export default BalanceDisplay 