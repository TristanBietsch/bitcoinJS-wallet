import React, { useEffect } from 'react'
import { View, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { ThemedText } from '@/src/components/ui/Text'
import ActionButton from '@/src/components/ui/Button/ActionButton'
import { useTransactionStore } from '@/src/store/transactionStore'
import { useTransactionExecution } from '@/src/hooks/send/useTransactionExecution'

/**
 * Test screen for the new transaction flow
 */
export default function TransactionTestScreen() {
  const router = useRouter()
  const transactionStore = useTransactionStore()
  const { getTransactionSummary } = useTransactionExecution()

  useEffect(() => {
    // Load fee rates when screen mounts
    transactionStore.loadFeeRates()
  }, [ transactionStore ])

  const setupTestTransaction = () => {
    // Set up a test transaction
    transactionStore.setRecipientAddress('tb1qunjkws5z3jxgh268c840kytl5622fwzf35k068')
    transactionStore.setAmount('1000', 'SATS')
    transactionStore.setSpeed('standard')
    
    Alert.alert(
      'Test Transaction Set',
      'Test transaction has been configured:\n\n' +
      '• Address: tb1qunjkws...35k068\n' +
      '• Amount: 1000 SATS\n' +
      '• Speed: Standard\n\n' +
      'Ready to test the flow!',
      [ { text: 'OK' } ]
    )
  }

  const testConfirmScreen = () => {
    if (!transactionStore.isValid()) {
      const errors = transactionStore.getValidationErrors()
      Alert.alert('Invalid Transaction', errors.join('\n'))
      return
    }
    
    router.push('/wallet/send/confirm' as any)
  }

  const showSummary = () => {
    const summary = getTransactionSummary()
    Alert.alert(
      'Transaction Summary',
      `Address: ${summary.recipientAddress}\n` +
      `Amount: ${summary.amount} sats\n` +
      `Fee: ${summary.fee} sats\n` +
      `Fee Rate: ${summary.feeRate} sats/vByte\n` +
      `Total: ${summary.total} sats\n` +
      `Speed: ${summary.speed}`,
      [ { text: 'OK' } ]
    )
  }

  const resetTransaction = () => {
    transactionStore.reset()
    Alert.alert('Reset', 'Transaction store has been reset')
  }

  const { transaction, feeRates, isLoadingFees, error } = transactionStore

  return (
    <SafeAreaContainer style={{ flex: 1, padding: 20 }}>
      <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        🧪 Transaction Flow Test
      </ThemedText>

      {/* Current State */}
      <View style={{ 
        backgroundColor : '#f5f5f5', 
        padding         : 15, 
        borderRadius    : 8, 
        marginBottom    : 20 
      }}>
        <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Current Transaction:
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Address: {transaction.recipientAddress || 'Not set'}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Amount: {transaction.amount} {transaction.currency}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Fee Rate: {transaction.feeRate} sats/vByte
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Estimated Fee: {transaction.estimatedFee} sats
        </ThemedText>
        <ThemedText style={{ fontSize: 14 }}>
          Speed: {transaction.speed}
        </ThemedText>
      </View>

      {/* Fee Rates */}
      <View style={{ 
        backgroundColor : '#e8f5e8', 
        padding         : 15, 
        borderRadius    : 8, 
        marginBottom    : 20 
      }}>
        <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          Network Fee Rates:
        </ThemedText>
        {isLoadingFees ? (
          <ThemedText style={{ fontSize: 14, fontStyle: 'italic' }}>
            Loading fee rates...
          </ThemedText>
        ) : feeRates ? (
          <>
            <ThemedText style={{ fontSize: 14 }}>Economy: {feeRates.economy} sats/vByte</ThemedText>
            <ThemedText style={{ fontSize: 14 }}>Standard: {feeRates.standard} sats/vByte</ThemedText>
            <ThemedText style={{ fontSize: 14 }}>Express: {feeRates.express} sats/vByte</ThemedText>
          </>
        ) : (
          <ThemedText style={{ fontSize: 14, color: '#ff4444' }}>
            Failed to load fee rates
          </ThemedText>
        )}
      </View>

      {/* Error Display */}
      {error && (
        <View style={{ 
          backgroundColor : '#ffebee', 
          padding         : 15, 
          borderRadius    : 8, 
          marginBottom    : 20,
          borderColor     : '#f44336',
          borderWidth     : 1
        }}>
          <ThemedText style={{ fontSize: 14, color: '#d32f2f' }}>
            ⚠️ {error}
          </ThemedText>
        </View>
      )}

      {/* Action Buttons */}
      <View style={{ gap: 15 }}>
        <ActionButton
          title="📝 Setup Test Transaction"
          onPress={setupTestTransaction}
        />
        
        <ActionButton
          title="📊 Show Summary"
          onPress={showSummary}
          disabled={!transactionStore.isValid()}
        />
        
        <ActionButton
          title="🚀 Test Confirm Screen"
          onPress={testConfirmScreen}
          disabled={!transactionStore.isValid()}
        />
        
        <ActionButton
          title="🔄 Reset Transaction"
          onPress={resetTransaction}
          backgroundColor="#6c757d"
        />
      </View>

      {/* Validation Status */}
      <View style={{ 
        marginTop       : 20,
        padding         : 15,
        backgroundColor : transactionStore.isValid() ? '#e8f5e8' : '#ffebee',
        borderRadius    : 8,
        borderColor     : transactionStore.isValid() ? '#4caf50' : '#f44336',
        borderWidth     : 1
      }}>
        <ThemedText style={{ 
          fontSize  : 14, 
          color     : transactionStore.isValid() ? '#2e7d32' : '#d32f2f',
          textAlign : 'center'
        }}>
          {transactionStore.isValid() 
            ? '✅ Transaction is valid' 
            : `❌ ${transactionStore.getValidationErrors().join(', ')}`
          }
        </ThemedText>
      </View>
    </SafeAreaContainer>
  )
} 