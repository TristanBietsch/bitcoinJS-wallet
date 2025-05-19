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
 * Completely rewritten balance display with anti-flicker technology
 * Uses direct animation control and prevents any component updates
 * during background refreshes
 */
const BalanceDisplay = (props: BalanceDisplayProps) => {
  const {
    isLoading,
    error,
    currency,
    formattedBalance,
    onRetry,
    currencySelector
  } = props
  
  // Store component refs that should never change to avoid re-renders
  const component = useRef({
    // Main balance value that's displayed
    displayValue : formattedBalance || '',
    
    // Animation values
    mainOpacity : new Animated.Value(1),
    
    // Stable representation of loading state
    isCurrentlyLoading : isLoading,
    
    // The last time the display was updated
    lastUpdateTime : Date.now(),
    
    // Flag to track initial vs subsequent loads
    hasShownInitialValue : !!formattedBalance,
    
    // Currency suffix for SATS
    currencySuffix : currency === 'SATS' ? ' Sats' : '',
  }).current
  
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
              Sats
            </ThemedText>
          </View>
        )
      }
      return (
        <ThemedText style={styles.balanceAmount}>
          {value}
        </ThemedText>
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
      
      // Reusable balance display
      balanceView : (displayValue: string) => (
        <Animated.View 
          style={[
            styles.balanceDisplayContainer, 
            { opacity: component.mainOpacity }
          ]}
        >
          {createBalanceText(displayValue, currency)}
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
  }, [ currency, error, onRetry ])
  
  // Update internal state without triggering re-renders
  useEffect(() => {
    // Skip this effect if we're just toggling loading state and already have a value
    if (component.displayValue && 
        component.hasShownInitialValue && 
        formattedBalance === component.displayValue) {
      component.isCurrentlyLoading = isLoading
      return
    }
    
    // Always update loading state
    component.isCurrentlyLoading = isLoading
    
    // Only update display if we have a real value and
    // 1. We've never shown a value before
    // 2. The value has actually changed
    // 3. We're not in a loading state
    if (formattedBalance && 
        (!component.hasShownInitialValue || 
         formattedBalance !== component.displayValue || 
         !isLoading)) {
      
      // Only animate if this isn't the first value and enough time has passed
      const shouldAnimate = component.hasShownInitialValue && 
                            (Date.now() - component.lastUpdateTime > 200)
      
      if (shouldAnimate) {
        // Fade out
        Animated.timing(component.mainOpacity, {
          toValue         : 0.3,
          duration        : 150,
          useNativeDriver : true
        }).start(() => {
          // Update value while faded
          component.displayValue = formattedBalance
          
          // Fade back in
          Animated.timing(component.mainOpacity, {
            toValue         : 1,
            duration        : 150,
            useNativeDriver : true
          }).start()
        })
      } else {
        // Just update without animation
        component.displayValue = formattedBalance
      }
      
      component.hasShownInitialValue = true
      component.lastUpdateTime = Date.now()
    }
  }, [ formattedBalance, isLoading, component ])
  
  // Currency suffix needs to be tracked separately
  useEffect(() => {
    component.currencySuffix = currency === 'SATS' ? ' Sats' : ''
  }, [ currency, component ])
  
  // Determine what content to render based on component state
  let mainContent
  
  if (!component.hasShownInitialValue && isLoading) {
    // Initial loading state
    mainContent = views.loadingView
  } else if (error) {
    // Error state
    mainContent = views.errorView
  } else {
    // Normal display with balance
    mainContent = (
      <>
        {views.balanceView(component.displayValue)}
        
        {/* Currency selector */}
        {currencySelector && (
          <View style={styles.currencySelectorContainer}>
            {currencySelector}
          </View>
        )}
        
        {/* Mini loader for background refreshes */}
        {isLoading && component.hasShownInitialValue && (
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