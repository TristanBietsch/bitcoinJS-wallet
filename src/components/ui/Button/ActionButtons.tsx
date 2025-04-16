import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

interface ActionButtonsProps {
  onPressSend: () => void
  onPressReceive: () => void
  sendLabel?: string
  receiveLabel?: string
}

/**
 * Reusable component for Send/Receive action buttons
 */
const ActionButtons = ({
  onPressSend,
  onPressReceive,
  sendLabel = 'Send',
  receiveLabel = 'Receive'
}: ActionButtonsProps) => {
  return (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={[ styles.actionButton, styles.buttonWidth ]}
        onPress={onPressSend}
      >
        <ThemedText style={styles.actionButtonText}>{sendLabel}</ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[ styles.actionButton, styles.buttonWidth ]}
        onPress={onPressReceive}
      >
        <ThemedText style={styles.actionButtonText}>{receiveLabel}</ThemedText>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  actionButtonsContainer : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 20,
  },
  buttonWidth : {
    width : '48%',
  },
  actionButton : {
    backgroundColor : 'red',
    borderRadius    : 30,
    paddingVertical : 16,
    alignItems      : 'center',
  },
  actionButtonText : {
    color      : 'white',
    fontWeight : 'bold',
    fontSize   : 18,
  },
})

export default ActionButtons 