import React, { ReactNode, useEffect, useRef, useMemo } from 'react'
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
  currencySelector?: ReactNode
}

/**
 * Balance display component that shows the current balance with proper currency formatting
 * Uses animation for smooth currency transitions
 */
const BalanceDisplay = (props: BalanceDisplayProps) => {
  const {
    isLoading,
    error,
    currency,
    formattedBalance,
    fadeAnim,
    onRetry,
    currencySelector
  } = props
  
  // Store loading state in a ref to avoid unnecessary re-renders
  const loadingRef = useRef(isLoading)
  
  // Update loading ref when prop changes
  useEffect(() => {
    loadingRef.current = isLoading
  }, [ isLoading ])
  
  // Create memoized views that won't change during prop updates
  const views = useMemo(() => {
    // Currency-specific render function
    const createBalanceText = (value: string, currency: CurrencyType) => {
      if (currency === 'SATS') {
        return (
          <View style={styles.balanceRow}>
            <ThemedText style={styles.balanceAmount}>
              {value}
            </ThemedText>
            <ThemedText style={styles.satsLabel}>
              SATS
            </ThemedText>
          </View>
        )
      }
      // BTC case
      return (
        <View style={styles.balanceRow}>
          <ThemedText style={styles.balanceAmount}>
            {value}
          </ThemedText>
          <ThemedText style={styles.satsLabel}>
            BTC
          </ThemedText>
        </View>
      )
    }
    
    return {
      // Loading view - only shown on initial load
      loadingView : (
        <LoadingIndicator style={styles.loader} />
      ),
      
      // Error view
      errorView : (
        <ErrorDisplay 
          error={error || 'Error loading balance'} 
          onRetry={onRetry} 
        />
      ),
      
      // Reusable balance display - directly uses the current formattedBalance
      balanceView : (
        <Animated.View 
          style={[
            styles.balanceDisplayContainer, 
            { opacity: fadeAnim }
          ]}
        >
          {createBalanceText(formattedBalance, currency)}
        </Animated.View>
      ),
      
      // Mini loading indicator (shown during background refresh)
      miniLoaderView : (
        <LoadingIndicator 
          style={styles.miniLoader} 
          size="small" 
        />
      )
    }
  }, [ currency, error, onRetry, fadeAnim, formattedBalance ])
  
  // Determine what content to render based on current state
  let mainContent
  
  if (!formattedBalance && isLoading) {
    // Initial loading state
    mainContent = views.loadingView
  } else if (error) {
    // Error state
    mainContent = views.errorView
  } else {
    // Normal display with balance
    mainContent = (
      <>
        {views.balanceView}
        
        {/* Currency selector */}
        {currencySelector && (
          <View style={styles.currencySelectorContainer}>
            {currencySelector}
          </View>
        )}
        
        {/* Mini loader for background refreshes */}
        {isLoading && formattedBalance && (
          views.miniLoaderView
        )}
      </>
    )
  }
  
  return (
    <View style={styles.balanceContainer}>
      <ThemedText type="default" style={styles.balanceLabel}>
        Current Balance:
      </ThemedText>
      {mainContent}
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
    marginBottom : 0,
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
    marginTop : 10,
    height    : 20,
    opacity   : 0.5,
  },
  balanceDisplayContainer : {
    opacity        : 1,
    height         : 60,
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