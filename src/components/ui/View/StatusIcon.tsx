import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'

interface StatusIconProps {
  type: 'send' | 'receive'
  accessibilityLabel?: string
}

export const StatusIcon = ({ type, accessibilityLabel }: StatusIconProps) => (
  <View style={styles.statusIconContainer}>
    <View 
      style={[ styles.statusIcon, type === 'receive' ? styles.receiveIcon : styles.sendIcon ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    >
      {type === 'send' ? (
        <ArrowUpRight size={32} color={Colors.light.transaction.send.icon} />
      ) : (
        <ArrowDownLeft size={32} color={Colors.light.transaction.receive.icon} />
      )}
    </View>
    <Text style={styles.statusText}>{type === 'send' ? 'Sent' : 'Received'}</Text>
  </View>
)

const styles = StyleSheet.create({
  statusIconContainer : {
    alignItems   : 'center',
    marginBottom : 48,
  },
  statusIcon : {
    width           : 64,
    height          : 64,
    borderRadius    : 32,
    backgroundColor : Colors.light.background,
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : 16,
  },
  sendIcon : {
    backgroundColor : Colors.light.transaction.send.background,
  },
  receiveIcon : {
    backgroundColor : Colors.light.transaction.receive.background,
  },
  statusText : {
    fontSize   : 24,
    fontWeight : '600',
  },
}) 