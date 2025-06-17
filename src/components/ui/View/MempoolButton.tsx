import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Linking, Alert } from 'react-native'
import { ExternalLink } from 'lucide-react-native'
import { BITCOIN_NETWORK, IS_TESTNET, IS_REGTEST } from '@/src/config/bitcoinNetwork'

interface MempoolButtonProps {
  txid?: string
  accessibilityLabel?: string
}

// Get the correct mempool URL based on the network
const getMempoolUrl = (txid: string): string => {
  if (IS_TESTNET) {
    return `https://mempool.space/testnet/tx/${txid}`
  } else if (IS_REGTEST) {
    // For regtest, we might not have a public explorer, so we'll show an alert
    return ''
  } else {
    // Mainnet
    return `https://mempool.space/tx/${txid}`
  }
}

export const MempoolButton = ({ txid, accessibilityLabel }: MempoolButtonProps) => {
  const handlePress = async () => {
    if (!txid) {
      Alert.alert('Error', 'Transaction ID not available')
      return
    }
    
    console.log(`🔗 [MempoolButton] Opening transaction ${txid} on ${BITCOIN_NETWORK} network`)
    
    if (IS_REGTEST) {
      Alert.alert(
        'Regtest Network', 
        'This transaction is on the local regtest network and cannot be viewed on a public block explorer.',
        [ { text: 'OK' } ]
      )
      return
    }
    
    const url = getMempoolUrl(txid)
    
    try {
      const canOpen = await Linking.canOpenURL(url)
      if (canOpen) {
        await Linking.openURL(url)
        console.log(`✅ [MempoolButton] Successfully opened ${url}`)
      } else {
        console.error(`❌ [MempoolButton] Cannot open URL: ${url}`)
        Alert.alert('Error', 'Unable to open the block explorer')
      }
    } catch (error) {
      console.error(`❌ [MempoolButton] Error opening URL: ${url}`, error)
      Alert.alert('Error', 'Failed to open the block explorer')
    }
  }
  
  const getButtonText = () => {
    if (IS_TESTNET) {
      return 'View on Mempool (Testnet)'
    } else if (IS_REGTEST) {
      return 'View on Explorer (Unavailable)'  
    } else {
      return 'View on Mempool'
    }
  }
  
  return (
    <TouchableOpacity 
      style={[ styles.mempoolButton, IS_REGTEST && styles.disabledButton ]}
      onPress={handlePress}
      disabled={!txid}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={[ styles.mempoolButtonText, IS_REGTEST && styles.disabledText ]}>
        {getButtonText()}
      </Text>
      <ExternalLink size={16} color={IS_REGTEST ? "#999" : "#000"} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  mempoolButton : {
    flexDirection   : 'row',
    alignItems      : 'center',
    gap             : 8,
    paddingVertical : 16,
    marginTop       : 8,
  },
  mempoolButtonText : {
    fontSize   : 16,
    fontWeight : '500',
  },
  disabledButton : {
    opacity : 0.6,
  },
  disabledText : {
    color : '#999',
  },
}) 