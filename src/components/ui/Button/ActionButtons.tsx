import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface ActionButtonsProps {
  onPressSend: () => void
  onPressReceive: () => void
  sendLabel?: string
  receiveLabel?: string
  containerStyle?: object
}

/**
 * Reusable component for Send/Receive action buttons
 */
const ActionButtons = ({
  onPressSend,
  onPressReceive,
  sendLabel = 'SEND',
  receiveLabel = 'RECEIVE',
  containerStyle = {}
}: ActionButtonsProps) => {
  return (
    <View style={[ styles.actionButtonsContainer, containerStyle ]}>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onPressReceive}
      >
        <View style={styles.buttonContent}>
          <ArrowDownLeft size={28} color={Colors.light.buttons.text} />
          <ThemedText style={styles.actionButtonText}>{receiveLabel}</ThemedText>
        </View>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={onPressSend}
      >
        <View style={styles.buttonContent}>
          <ArrowUpRight size={28} color={Colors.light.buttons.text} />
          <ThemedText style={styles.actionButtonText}>{sendLabel}</ThemedText>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  actionButtonsContainer : {
    flexDirection    : 'row',
    justifyContent   : 'space-between',
    marginHorizontal : 20,
    marginBottom     : 20,
  },
  actionButton : {
    backgroundColor : Colors.light.buttons.primary,
    borderRadius    : 30,
    paddingVertical : 16,
    alignItems      : 'center',
    width           : '48%',
  },
  buttonContent : {
    flexDirection : 'row',
    alignItems    : 'center',
  },
  actionButtonText : {
    color      : Colors.light.buttons.text,
    fontWeight : 'bold',
    fontSize   : 18,
    marginLeft : 8,
  },
})

export default ActionButtons 