import React from 'react'
import { TouchableOpacity, Text, StyleSheet, Linking } from 'react-native'
import { ExternalLink } from 'lucide-react-native'

interface MempoolButtonProps {
  txid?: string
  accessibilityLabel?: string
}

export const MempoolButton = ({ txid, accessibilityLabel }: MempoolButtonProps) => {
  const handlePress = () => {
    if (txid) {
      Linking.openURL(`https://mempool.space/tx/${txid}`)
    }
  }
  
  return (
    <TouchableOpacity 
      style={styles.mempoolButton} 
      onPress={handlePress}
      disabled={!txid}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Text style={styles.mempoolButtonText}>View on Mempool</Text>
      <ExternalLink size={16} color="#000" />
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
}) 