import React from 'react'
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { Stack } from 'expo-router'

import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import ScreenFooter from '@/src/components/layout/ScreenFooter'
import ActionButton from '@/src/components/ui/Button/ActionButton'
import NumberPad from '@/src/components/ui/NumberPad'
import AmountEntrySection from '@/src/components/features/Send/Amount/AmountEntrySection'
import { ThemedText } from '@/src/components/ui/Text'
import { useSendAmount } from '@/src/hooks/send/useSendAmount'

export default function SendAmountScreen() {
  const {
    // Display values
    amount,
    currency,
    
    // Bitcoin state
    walletBalance,
    
    // Loading states only
    isLoadingBalance,
    
    // Validation
    canProceedToNext,
    
    // Handlers
    handleCurrencyChange,
    handleNumberPress,
    handleBackspace,
    handleBackPress,
    handleContinue,
    
    // Actions
    refreshBalance
  } = useSendAmount()

  // Format satoshis for display
  const formatSats = (sats: number): string => {
    if (sats === 0) return '0 sats'
    return sats.toLocaleString() + ' sats'
  }

  // Debug logging for balance issues
  React.useEffect(() => {
    console.log('SendAmountScreen - Balance state:', {
      isLoadingBalance,
      confirmedBalance   : walletBalance.confirmed,
      unconfirmedBalance : walletBalance.unconfirmed,
      totalBalance       : walletBalance.total
    })
  }, [ isLoadingBalance, walletBalance ])

  return (
    <SafeAreaContainer>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />
      
      {/* Custom Back Button */}
      <BackButton onPress={handleBackPress} />
      
      {/* Amount Entry Section */}
      <AmountEntrySection
        amount={amount}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
      />

      {/* Bitcoin Information Section */}
      <View style={styles.infoSection}>
        {/* Wallet Balance */}
        <View style={styles.balanceContainer}>
          <ThemedText style={styles.balanceLabel}>Available Balance</ThemedText>
          {isLoadingBalance ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#666" />
              <ThemedText style={styles.loadingText}>Loading balance...</ThemedText>
            </View>
          ) : (
            <View style={styles.balanceInfo}>
              <ThemedText style={styles.balanceAmount}>
                {formatSats(walletBalance.confirmed)}
              </ThemedText>
              {walletBalance.unconfirmed > 0 && (
                <ThemedText style={styles.unconfirmedBalance}>
                  +{formatSats(walletBalance.unconfirmed)} pending
                </ThemedText>
              )}
              {walletBalance.confirmed === 0 && walletBalance.unconfirmed === 0 && (
                <TouchableOpacity onPress={refreshBalance} style={styles.refreshButton}>
                  <ThemedText style={styles.refreshText}>Tap to refresh</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
      
      {/* Footer with Continue Button and Number Pad */}
      <ScreenFooter withBorder={false}>
        {/* Continue Button */}
        <ActionButton
          title="Continue"
          onPress={handleContinue}
          disabled={!canProceedToNext}
          style={{ 
            marginBottom : 40,
            borderRadius : 30,
            opacity      : !canProceedToNext ? 0.5 : 1
          }}
        />
        
        {/* Number Pad */}
        <NumberPad
          onNumberPress={handleNumberPress}
          onBackspace={handleBackspace}
        />
      </ScreenFooter>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  infoSection : {
    paddingHorizontal : 20,
    paddingVertical   : 16,
    marginTop         : 20,
  },
  balanceContainer : {
    backgroundColor : '#f8f9fa',
    borderRadius    : 12,
    padding         : 16,
    marginBottom    : 12,
  },
  balanceLabel : {
    fontSize     : 14,
    color        : '#666',
    marginBottom : 4,
  },
  balanceInfo : {
    flexDirection : 'row',
    alignItems    : 'baseline',
  },
  balanceAmount : {
    fontSize   : 18,
    fontWeight : '600',
    color      : '#000',
  },
  unconfirmedBalance : {
    fontSize   : 14,
    color      : '#ffa726',
    marginLeft : 8,
    fontStyle  : 'italic',
  },
  loadingContainer : {
    flexDirection : 'row',
    alignItems    : 'center',
  },
  loadingText : {
    fontSize   : 16,
    color      : '#666',
    marginLeft : 8,
  },
  refreshButton : {
    padding : 8,
  },
  refreshText : {
    fontSize : 14,
    color    : '#666',
  },
}) 