import React, { ReactNode, useEffect, useState, useRef, memo } from 'react'
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
const BalanceDisplay = memo(({
  isLoading,
  error,
  currency,
  formattedBalance,
  fadeAnim,
  onRetry,
  currencySelector
}: BalanceDisplayProps) => {
  // Store the last non-loading balance for smooth transitions
  const [stableBalance, setStableBalance] = useState(formattedBalance)
  const prevLoadingRef = useRef(isLoading)

  // Only update the displayed balance when not loading
  useEffect(() => {
    // If we're not in a loading state, update the stable balance
    if (!isLoading && formattedBalance !== stableBalance) {
      setStableBalance(formattedBalance)
    }
    
    prevLoadingRef.current = isLoading
  }, [ isLoading, formattedBalance, stableBalance ])

  // Render the balance based on currency type
  const renderBalance = () => {
    // Use stableBalance to prevent flickering during loading
    const displayBalance = isLoading ? stableBalance : formattedBalance
    
    if (currency === 'SATS') {
      return (
        <View style={styles.balanceRow}>
          <ThemedText style={styles.balanceAmount}>
            {displayBalance}
          </ThemedText>
          <ThemedText style={styles.satsLabel}>
            Sats
          </ThemedText>
        </View>
      )
    } else {
      return (
        <ThemedText style={styles.balanceAmount}>
          {displayBalance}
        </ThemedText>
      )
    }
  }

  return (
    <View style={styles.balanceContainer}>
      <ThemedText type="default" style={styles.balanceLabel}>
        Current Balance:
      </ThemedText>
      
      {isLoading && !stableBalance ? (
        <LoadingIndicator style={styles.loader} />
      ) : error ? (
        <ErrorDisplay error={error} onRetry={onRetry} />
      ) : (
        <>
          <Animated.View style={[styles.balanceDisplayContainer, { opacity: fadeAnim }]}>
            {renderBalance()}
          </Animated.View>
          
          {/* Render currency selector directly below balance */}
          {currencySelector && (
            <View style={styles.currencySelectorContainer}>
              {currencySelector}
            </View>
          )}
          
          {/* Show a small loading indicator only if we have a stable balance to display */}
          {isLoading && stableBalance && (
            <LoadingIndicator 
              style={styles.miniLoader} 
              size="small" 
            />
          )}
        </>
      )}
    </View>
  )
})

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
  miniLoader : {
    marginTop  : 10,
    height     : 20,
    opacity    : 0.5,
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