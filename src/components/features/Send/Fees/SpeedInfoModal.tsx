import React from 'react'
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Clock, X } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'

interface SpeedInfoModalProps {
  visible: boolean
  onClose: () => void
}

export const SpeedInfoModal: React.FC<SpeedInfoModalProps> = ({
  visible,
  onClose
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.infoModalOverlay}>
        <View style={styles.infoModalContainer}>
          <View style={styles.infoModalHeader}>
            <ThemedText style={styles.infoModalTitle}>Confirmation Speed</ThemedText>
            <TouchableOpacity 
              style={styles.infoModalCloseButton} 
              onPress={onClose}
            >
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoModalContent}>
            <View style={styles.infoIconContainer}>
              <Clock size={40} color={Colors.light.buttons.primary} />
            </View>
            
            <ThemedText style={styles.infoModalText}>
              Confirmation speed determines how quickly your Bitcoin transaction will be processed by the network.
            </ThemedText>
            
            <View style={styles.infoOptionContainer}>
              <ThemedText style={styles.infoOptionTitle}>Economy</ThemedText>
              <ThemedText style={styles.infoOptionText}>
                Lowest fees, but may take longer (1-2 hours) to confirm. Best for non-urgent transfers.
              </ThemedText>
            </View>
            
            <View style={styles.infoOptionContainer}>
              <ThemedText style={styles.infoOptionTitle}>Standard</ThemedText>
              <ThemedText style={styles.infoOptionText}>
                Balanced fees and confirmation time (30-60 minutes). Good for most transactions.
              </ThemedText>
            </View>
            
            <View style={styles.infoOptionContainer}>
              <ThemedText style={styles.infoOptionTitle}>Express</ThemedText>
              <ThemedText style={styles.infoOptionText}>
                Highest fees, but faster confirmations (10-20 minutes). Ideal for urgent transfers.
              </ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.infoModalButton}
            onPress={onClose}
          >
            <ThemedText style={styles.infoModalButtonText}>Got it</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  infoModalOverlay : {
    flex            : 1,
    backgroundColor : 'rgba(0, 0, 0, 0.5)',
    justifyContent  : 'center',
    alignItems      : 'center',
    padding         : 20
  },
  infoModalContainer : {
    backgroundColor : '#FFFFFF',
    borderRadius    : 16,
    width           : '100%',
    maxHeight       : '80%',
    padding         : 20,
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.25,
    shadowRadius    : 3.84,
    elevation       : 5
  },
  infoModalHeader : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 20,
    position      : 'relative'
  },
  infoModalTitle : {
    fontSize   : 20,
    fontWeight : '600',
    textAlign  : 'center',
    flex       : 1
  },
  infoModalCloseButton : {
    padding  : 5,
    position : 'absolute',
    right    : 0
  },
  infoModalContent : {
    marginBottom : 20
  },
  infoIconContainer : {
    alignItems   : 'center',
    marginBottom : 20
  },
  infoModalText : {
    fontSize     : 16,
    lineHeight   : 24,
    marginBottom : 20,
    textAlign    : 'center'
  },
  infoOptionContainer : {
    marginBottom    : 15,
    backgroundColor : '#F9F9F9',
    borderRadius    : 12,
    padding         : 15
  },
  infoOptionTitle : {
    fontSize     : 16,
    fontWeight   : '600',
    marginBottom : 5
  },
  infoOptionText : {
    fontSize   : 14,
    lineHeight : 20,
    color      : '#555'
  },
  infoModalButton : {
    backgroundColor : Colors.light.buttons.primary,
    borderRadius    : 12,
    height          : 50,
    justifyContent  : 'center',
    alignItems      : 'center',
    marginTop       : 10
  },
  infoModalButtonText : {
    color      : Colors.light.buttons.text,
    fontSize   : 16,
    fontWeight : '600'
  }
}) 