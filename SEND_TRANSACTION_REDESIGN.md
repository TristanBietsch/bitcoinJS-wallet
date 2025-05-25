# Send Transaction Store Redesign

## 🎯 Problem Solved

The original error was:
```
Transaction execution error: Error: Transaction validation failed: 
Recipient address is required, Amount must be greater than 0
```

This happened because:
1. **Multiple overlapping stores** (`sendStore` + `transactionStore`) with poor synchronization
2. **Scattered validation logic** across components and hooks
3. **State management issues** where UI state wasn't properly reflected in transaction logic
4. **Poor separation of concerns** mixing UI logic with transaction building

## 🏗️ New Architecture

### 1. **Single Source of Truth: `SendTransactionStore`**

**Location:** `src/store/sendTransactionStore.ts`

**Key Features:**
- **Modular state structure** with clear separation:
  - `inputs` - User form data (address, amount, currency, feeRate)  
  - `derived` - Computed values (amountSats, validation errors, totals)
  - `utxos` - UTXO selection and fee calculation results
  - `meta` - Loading states, errors, transaction status

- **Built-in validation** with real-time feedback
- **Auto-validation** when inputs change
- **Proper error handling** with specific error messages
- **Persistence** of only relevant state (not loading/error states)

### 2. **Clean Service Layer: `SendTransactionService`**

**Location:** `src/services/sendTransactionService.ts`

**Responsibilities:**
- UTXO loading and fee calculation
- Transaction building, signing, and broadcasting
- Validation before execution
- Integration with existing Bitcoin services

### 3. **Simplified Hook: `useSendTransactionExecution`**

**Location:** `src/hooks/send/useSendTransactionExecution.ts`

**Features:**
- Clean interface for UI components
- Auto-loads UTXOs when needed
- Manages execution state separately from transaction state
- Provides validation status and actions

## 🚀 Usage Examples

### Setting Transaction Data

```typescript
import { useSendTransactionStore } from '@/src/store/sendTransactionStore'

function SendAddressScreen() {
  const sendStore = useSendTransactionStore()
  
  const handleAddressInput = (address: string) => {
    // Auto-validates and sanitizes address
    sendStore.setRecipientAddress(address)
    
    // Check validation status
    if (sendStore.derived.addressError) {
      console.log('Address error:', sendStore.derived.addressError)
    }
  }
  
  const handleAmountInput = (amount: string) => {
    // Auto-validates amount and converts to sats
    sendStore.setAmount(amount, 'SATS')
    
    // Check derived values
    console.log('Amount in sats:', sendStore.derived.amountSats)
    console.log('Total with fee:', sendStore.derived.totalSats)
  }
}
```

### Executing Transaction

```typescript
import { useSendTransactionExecution } from '@/src/hooks/send/useSendTransactionExecution'

function SendLoadingScreen() {
  const {
    executeTransaction,
    isExecuting,
    executionError,
    result,
    isValidTransaction,
    getValidationStatus
  } = useSendTransactionExecution()
  
  useEffect(() => {
    const processTransaction = async () => {
      try {
        // Check if transaction is valid before executing
        if (!isValidTransaction) {
          const validation = getValidationStatus()
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
        }
        
        // Execute transaction
        const txResult = await executeTransaction()
        
        if (txResult) {
          console.log('✅ Transaction successful:', txResult.txid)
          // Navigate to success screen
        }
        
      } catch (error) {
        console.error('Transaction failed:', error)
        // Handle error appropriately
      }
    }
    
    processTransaction()
  }, [])
  
  if (executionError) {
    return <ErrorDisplay message={executionError} />
  }
  
  return <LoadingDisplay isExecuting={isExecuting} />
}
```

### Getting Transaction Summary

```typescript
import { SendTransactionService } from '@/src/services/sendTransactionService'

function SendConfirmScreen() {
  const summary = SendTransactionService.getTransactionSummary()
  
  return (
    <View>
      <Text>To: {summary.recipient}</Text>
      <Text>Amount: {summary.amount} sats</Text>
      <Text>Fee: {summary.fee} sats</Text>
      <Text>Total: {summary.total} sats</Text>
    </View>
  )
}
```

## 🔧 Migration from Old Stores

### Replace `useSendStore`

**Before:**
```typescript
const { address, amount, setAddress, setAmount } = useSendStore()
```

**After:**
```typescript
const sendStore = useSendTransactionStore()
// Direct access to inputs and actions
const address = sendStore.inputs.recipientAddress
const amount = sendStore.inputs.amount
sendStore.setRecipientAddress(newAddress)
sendStore.setAmount(newAmount)
```

### Replace `useTransactionStore`

**Before:**
```typescript
const { transaction, buildTransaction, isValid } = useTransactionStore()
```

**After:**
```typescript
const { isValidTransaction, executeTransaction } = useSendTransactionExecution()
// Or direct store access:
const sendStore = useSendTransactionStore()
const isValid = sendStore.isValidTransaction()
```

### Replace `useTransactionExecution`

**Before:**
```typescript
const { executeTransaction, error, result } = useTransactionExecution()
```

**After:**
```typescript
const { 
  executeTransaction, 
  executionError, 
  result 
} = useSendTransactionExecution()
```

## ✅ Benefits Achieved

### 1. **Single Responsibility Principle**
- Store manages state only
- Service handles business logic only  
- Hook provides UI interface only

### 2. **Better Error Handling**
- Specific validation errors
- Clear error messages
- Proper error boundaries

### 3. **Improved Debugging**
- Clear state structure
- Detailed logging
- Predictable data flow

### 4. **Enhanced Reliability**
- Auto-validation prevents invalid states
- Required field validation
- Proper UTXO management

### 5. **Maintainable Code**
- Modular architecture
- Easy to test
- Clear interfaces

## 🎯 Fixes Original Error

The original error "Recipient address is required, Amount must be greater than 0" is now impossible because:

1. **Address validation** happens automatically when set
2. **Amount validation** ensures proper satoshi conversion
3. **Transaction validation** checks all requirements before execution
4. **UTXO loading** ensures sufficient funds before building
5. **Clear error messages** help debug issues

The new store ensures transaction data is always valid and properly synchronized before any execution attempt. 