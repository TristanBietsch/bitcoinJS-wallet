import React, { useEffect } from 'react'
import { View, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { ThemedText } from '@/src/components/ui/Text'
import ActionButton from '@/src/components/ui/Button/ActionButton'
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'
import { SendTransactionService } from '@/src/services/sendTransactionService'

/**
 * Test screen for the new transaction flow
 */
export default function TransactionTestScreen() {
  const router = useRouter()
  const sendStore = useSendTransactionStore()

  useEffect(() => {
    // Auto-load UTXOs when component mounts if we have transaction data
    if (sendStore.derived.amountSats > 0) {
      SendTransactionService.loadUtxosAndCalculateFees().catch(console.error)
    }
  }, [ sendStore.derived.amountSats ])

  const setupTestTransaction = () => {
    // Set up a test transaction
    sendStore.setRecipientAddress('tb1qunjkws5z3jxgh268c840kytl5622fwzf35k068')
    sendStore.setAmount('1000', 'SATS')
    sendStore.setFeeRate(10) // Standard fee rate
    
    Alert.alert(
      'Test Transaction Set',
      'Test transaction has been configured:\n\n' +
      '• Address: tb1qunjkws...35k068\n' +
      '• Amount: 1000 SATS\n' +
      '• Fee Rate: 10 sats/vByte\n\n' +
      'Ready to test the flow!',
      [ { text: 'OK' } ]
    )
  }

  const testConfirmScreen = () => {
    if (!sendStore.isValidTransaction()) {
      const errors = sendStore.getValidationErrors()
      Alert.alert('Invalid Transaction', errors.join('\n'))
      return
    }
    
    router.push('/wallet/send/confirm' as any)
  }

  const showSummary = () => {
    const summary = SendTransactionService.getTransactionSummary()
    Alert.alert(
      'Transaction Summary',
      `Address: ${summary.recipient}\n` +
      `Amount: ${summary.amount} sats\n` +
      `Fee: ${summary.fee} sats\n` +
      `Total: ${summary.total} sats\n` +
      `Currency: ${summary.currency}`,
      [ { text: 'OK' } ]
    )
  }

  const resetTransaction = () => {
    sendStore.reset()
    Alert.alert('Reset', 'Transaction store has been reset')
  }

  const { inputs, derived, utxos, meta } = sendStore

  return (
    <SafeAreaContainer style={{ flex: 1, padding: 20 }}>
      <ThemedText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        🧪 Send Transaction Test
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
          Address: {inputs.recipientAddress || 'Not set'}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Amount: {inputs.amount} {inputs.currency}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Amount (sats): {derived.amountSats}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Fee Rate: {inputs.feeRate} sats/vByte
        </ThemedText>
        <ThemedText style={{ fontSize: 14, marginBottom: 5 }}>
          Estimated Fee: {derived.estimatedFee} sats
        </ThemedText>
        <ThemedText style={{ fontSize: 14 }}>
          Total: {derived.totalSats} sats
        </ThemedText>
      </View>

      {/* UTXO Information */}
      <View style={{ 
        backgroundColor : '#e8f5e8', 
        padding         : 15, 
        borderRadius    : 8, 
        marginBottom    : 20 
      }}>
        <ThemedText style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
          UTXO Selection:
        </ThemedText>
        {meta.isLoadingUtxos ? (
          <ThemedText style={{ fontSize: 14, fontStyle: 'italic' }}>
            Loading UTXOs...
          </ThemedText>
        ) : utxos.selectedUtxos.length > 0 ? (
          <>
            <ThemedText style={{ fontSize: 14 }}>Selected UTXOs: {utxos.selectedUtxos.length}</ThemedText>
            <ThemedText style={{ fontSize: 14 }}>Total Value: {utxos.totalUtxoValue} sats</ThemedText>
            <ThemedText style={{ fontSize: 14 }}>Change: {utxos.changeAmount} sats</ThemedText>
            <ThemedText style={{ fontSize: 14 }}>Estimated Size: {derived.estimatedSize} vBytes</ThemedText>
          </>
        ) : (
          <ThemedText style={{ fontSize: 14, color: '#666' }}>
            No UTXOs selected yet
          </ThemedText>
        )}
      </View>

      {/* Error Display */}
      {(meta.error || derived.addressError || derived.amountError || derived.feeError) && (
        <View style={{ 
          backgroundColor : '#ffebee', 
          padding         : 15, 
          borderRadius    : 8, 
          marginBottom    : 20,
          borderColor     : '#f44336',
          borderWidth     : 1
        }}>
          <ThemedText style={{ fontSize: 14, color: '#d32f2f' }}>
            ⚠️ {meta.error || derived.addressError || derived.amountError || derived.feeError}
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
          disabled={!sendStore.isValidTransaction()}
        />
        
        <ActionButton
          title="🚀 Test Confirm Screen"
          onPress={testConfirmScreen}
          disabled={!sendStore.isValidTransaction()}
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
        backgroundColor : sendStore.isValidTransaction() ? '#e8f5e8' : '#ffebee',
        borderRadius    : 8,
        borderColor     : sendStore.isValidTransaction() ? '#4caf50' : '#f44336',
        borderWidth     : 1
      }}>
        <ThemedText style={{ 
          fontSize  : 14, 
          color     : sendStore.isValidTransaction() ? '#2e7d32' : '#d32f2f',
          textAlign : 'center'
        }}>
          {sendStore.isValidTransaction() 
            ? '✅ Transaction is valid' 
            : `❌ ${sendStore.getValidationErrors().join(', ')}`
          }
        </ThemedText>
      </View>
    </SafeAreaContainer>
  )
} 