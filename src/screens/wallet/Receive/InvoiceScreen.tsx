import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

// Import modularized components
import InvoiceScreenLayout from '@/src/components/layout/InvoiceScreenLayout'
import QRCodeDisplay from '@/src/components/features/Receive/QRCodeDisplay'
import AddressDisplay from '@/src/components/features/Receive/AddressDisplay'
import InvoiceActionButtons from '@/src/components/features/Receive/InvoiceActionButtons'
import { ThemedText } from '@/src/components/ui/Text'

// Import hooks and services
import { useConvertBitcoin } from '@/src/hooks/bitcoin/useConvertBitcoin'
import { generateBitcoinAddress } from '@/src/services/bitcoin/addressService'
import { useClipboard } from '@/src/hooks/ui/useClipboard'
import { shareContent } from '@/src/utils/file/fileSharing'

export default function InvoiceScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ amount: string; currency: string }>()
  
  // Use the Bitcoin conversion hook
  const { getConvertedAmounts, refreshPrice } = useConvertBitcoin()
  
  // Get the Bitcoin address - in a real app, this would be generated for each invoice
  const [ address, setAddress ] = React.useState<string>('')
  
  // Clipboard functionality
  const { copyToClipboard } = useClipboard()
  
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
  
  // Handle copy to clipboard
  const handleCopy = () => {
    copyToClipboard(address)
  }
  
  // Handle sharing of address
  const handleShare = () => {
    const shareMessage = `Bitcoin Payment Request\nAmount: ${amounts.sats} SATS (≈$${amounts.usd} USD)\nAddress: ${address}`
    shareContent(shareMessage, 'Bitcoin Invoice')
  }
  
  return (
    <InvoiceScreenLayout onBackPress={handleBackPress}>
      {/* QR Code */}
      <View style={styles.qrContainer}>
        <QRCodeDisplay 
          value={address} 
          size={200}
        />
      </View>
      
      {/* Requesting Amount */}
      <View style={styles.amountContainer}>
        <ThemedText style={styles.amountLabel}>Requesting Amount:</ThemedText>
        <ThemedText style={styles.amountValue}>
          {amounts.sats} <ThemedText style={styles.amountUnit}>Sats</ThemedText>
        </ThemedText>
        <ThemedText style={styles.usdValue}>≈ ${amounts.usd} USD</ThemedText>
      </View>
      
      {/* Address Display */}
      <AddressDisplay 
        address={address}
        label="on-chain address:"
      />
      
      {/* Action Buttons */}
      <InvoiceActionButtons 
        onCopy={handleCopy}
        onShare={handleShare}
      />
    </InvoiceScreenLayout>
  )
}

const styles = StyleSheet.create({
  qrContainer : {
    marginTop    : 40,
    marginBottom : 20
  },
  amountContainer : {
    alignItems   : 'center',
    marginBottom : 20
  },
  amountLabel : {
    fontSize     : 14,
    color        : '#666',
    marginBottom : 8
  },
  amountValue : {
    fontSize     : 28,
    fontWeight   : 'bold',
    marginBottom : 4
  },
  amountUnit : {
    fontSize   : 28,
    fontWeight : 'bold'
  },
  usdValue : {
    fontSize : 14,
    color    : '#666'
  }
}) 