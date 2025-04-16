import React, { useEffect } from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import BitcoinAddressDisplay from '@/src/components/features/Receive/BitcoinAddressDisplay'
import RequestAmountDisplay from '@/src/components/features/Wallet/RequestAmountDisplay'
import ShareButton from '@/src/components/ui/Button/ShareButton'
import { useConvertBitcoin } from '@/src/hooks/bitcoin/useConvertBitcoin'
import { generateBitcoinAddress } from '@/src/services/bitcoin/addressService'
import { useClipboard } from '@/src/hooks/ui/useClipboard'
import CopyButton from '@/src/components/ui/Button/CopyButton'

export default function InvoiceScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ amount: string; currency: string }>()
  
  // Use the Bitcoin conversion hook
  const { getConvertedAmounts, refreshPrice } = useConvertBitcoin()
  
  // Get the Bitcoin address - in a real app, this would be generated for each invoice
  const [ address, setAddress ] = React.useState<string>('')
  
  // Clipboard functionality
  const { copied, copyToClipboard } = useClipboard()
  
  // Fetch Bitcoin address
  useEffect(() => {
    const fetchAddress = async () => {
      const addr = await generateBitcoinAddress()
      setAddress(addr)
    }
    fetchAddress()
  }, [ ])
  
  // Refresh Bitcoin price when component mounts
  useEffect(() => {
    refreshPrice()
  }, [ refreshPrice ])
  
  // Convert amounts based on parameters
  const amounts = getConvertedAmounts(
    params.amount || '0',
    params.currency || 'BTC'
  )
  
  // Handle back navigation
  const handleBackPress = () => {
    router.back()
  }
  
  // Create share message
  const shareMessage = `Bitcoin Payment Request\nAmount: ${params.amount} ${params.currency}\nAddress: ${address}`
  
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Back Button */}
      <View style={styles.header}>
        <BackButton onPress={handleBackPress} accessibilityLabel="Go back" />
      </View>
      
      <View style={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountSection}>
          <RequestAmountDisplay 
            satsAmount={amounts.sats}
            usdAmount={amounts.usd}
          />
        </View>
        
        {/* Bitcoin Address Display with QR */}
        <View style={styles.addressSection}>
          <BitcoinAddressDisplay 
            address={address} 
            showCopyButton={false}
            qrSize={180}
            label="bitcoin address:"
          />
        </View>
        
        {/* Buttons Row */}
        <View style={styles.buttonsRow}>
          <CopyButton 
            onPress={() => copyToClipboard(address)}
            copied={copied}
            style={styles.actionButton}
          />
          <ShareButton 
            message={shareMessage}
            title="Bitcoin Payment Request"
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : 'white',
  },
  header : {
    paddingHorizontal : 16,
    paddingTop        : 12,
    paddingBottom     : 0,
  },
  content : {
    flex              : 1,
    justifyContent    : 'flex-start',
    alignItems        : 'center',
    paddingHorizontal : 24,
    paddingBottom     : 20,
  },
  amountSection : {
    width      : '100%',
    alignItems : 'center',
    marginTop  : 10,
  },
  addressSection : {
    width      : '100%',
    alignItems : 'center',
    marginTop  : 12,
  },
  buttonsRow : {
    flexDirection  : 'row',
    justifyContent : 'center',
    gap            : 16,
    marginTop      : 12,
    marginBottom   : 16,
  },
  actionButton : {
    width          : 48,
    height         : 48,
    padding        : 0,
    borderRadius   : 24,
    alignItems     : 'center',
    justifyContent : 'center',
  },
}) 