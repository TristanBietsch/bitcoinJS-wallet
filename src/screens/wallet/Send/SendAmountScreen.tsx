import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
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
    feeCalculation,
    estimatedFee,
    totalRequired,
    
    // Loading and error states
    isLoadingBalance,
    isCalculatingFee,
    balanceError,
    validationError,
    
    // Validation
    canProceed,
    
    // Handlers
    handleCurrencyChange,
    handleNumberPress,
    handleBackspace,
    handleBackPress,
    handleContinue
  } = useSendAmount()

  // Format satoshis for display
  const formatSats = (sats: number): string => {
    return sats.toLocaleString() + ' sats'
  }

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
          ) : balanceError ? (
            <ThemedText style={styles.errorText}>{balanceError}</ThemedText>
          ) : (
            <ThemedText style={styles.balanceAmount}>
              {formatSats(walletBalance.confirmed)}
            </ThemedText>
          )}
        </View>

        {/* Fee Information */}
        {estimatedFee > 0 && (
          <View style={styles.feeContainer}>
            <View style={styles.feeRow}>
              <ThemedText style={styles.feeLabel}>Network Fee</ThemedText>
              {isCalculatingFee ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <ThemedText style={styles.feeAmount}>
                  {formatSats(estimatedFee)}
                </ThemedText>
              )}
            </View>
            
            {feeCalculation && (
              <View style={styles.feeDetails}>
                <ThemedText style={styles.feeDetailText}>
                  Transaction size: ~{feeCalculation.estimatedSize} vBytes
                </ThemedText>
                <ThemedText style={styles.feeDetailText}>
                  Total required: {formatSats(totalRequired)}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Validation Error */}
        {validationError && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.validationError}>{validationError}</ThemedText>
          </View>
        )}
      </View>
      
      {/* Footer with Continue Button and Number Pad */}
      <ScreenFooter withBorder={false}>
        {/* Continue Button */}
        <ActionButton
          title="Continue"
          onPress={handleContinue}
          disabled={!canProceed}
          style={{ 
            marginBottom : 40,
            borderRadius : 30,
            opacity      : !canProceed ? 0.5 : 1
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
  balanceAmount : {
    fontSize   : 18,
    fontWeight : '600',
    color      : '#000',
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
  errorText : {
    fontSize : 16,
    color    : '#ff6b6b',
  },
  feeContainer : {
    backgroundColor : '#fff8f0',
    borderRadius    : 12,
    padding         : 16,
    marginBottom    : 12,
    borderLeftWidth : 3,
    borderLeftColor : '#ffa726',
  },
  feeRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    alignItems     : 'center',
    marginBottom   : 8,
  },
  feeLabel : {
    fontSize : 14,
    color    : '#e65100',
  },
  feeAmount : {
    fontSize   : 16,
    fontWeight : '600',
    color      : '#e65100',
  },
  feeDetails : {
    marginTop      : 8,
    paddingTop     : 8,
    borderTopWidth : 1,
    borderTopColor : '#ffe0b3',
  },
  feeDetailText : {
    fontSize     : 12,
    color        : '#bf360c',
    marginBottom : 2,
  },
  errorContainer : {
    backgroundColor : '#fff5f5',
    borderRadius    : 12,
    padding         : 16,
    borderLeftWidth : 3,
    borderLeftColor : '#ff6b6b',
  },
  validationError : {
    fontSize : 14,
    color    : '#d32f2f',
  },
}) 