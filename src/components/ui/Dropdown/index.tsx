import React, { useState } from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  FlatList,
  TouchableWithoutFeedback
} from 'react-native'
import { Colors } from '@/src/constants/colors'

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  title?: string;
  cancelButtonLabel?: string;
};

const Dropdown = ({ 
  options, 
  selectedValue, 
  onSelect, 
  placeholder = 'Select an option',
  backgroundColor = Colors.light.buttons.primary,
  textColor = Colors.light.buttons.text,
  disabled = false,
  title = 'Select an option',
  cancelButtonLabel = 'Cancel'
}: DropdownProps) => {
  const [ visible, setVisible ] = useState(false)
  
  // Find the currently selected option
  const selectedOption = options.find(option => option.value === selectedValue)

  const toggleDropdown = () => {
    if (disabled) return
    setVisible(!visible)
  }

  const handleSelect = (value: string) => {
    onSelect(value)
    setVisible(false)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[ 
          styles.dropdownButton, 
          { backgroundColor },
          disabled && styles.disabledButton
        ]}
        onPress={toggleDropdown}
        disabled={disabled}
      >
        <Text style={[ styles.buttonText, { color: textColor } ]}>
          {selectedOption ? selectedOption.label : placeholder} ▼
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={() => setVisible(false)}>
                  <Text style={styles.cancelButton}>{cancelButtonLabel}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.optionsContainer}>
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.option, 
                        selectedValue === item.value && styles.selectedOption
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      <Text 
                        style={[
                          styles.optionText, 
                          selectedValue === item.value && styles.selectedOptionText
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    position : 'relative',
    zIndex   : 1,
  },
  dropdownButton : {
    flexDirection     : 'row',
    alignItems        : 'center',
    justifyContent    : 'center',
    paddingVertical   : 10,
    paddingHorizontal : 20,
    borderRadius      : 20,
  },
  disabledButton : {
    opacity : 0.6,
  },
  buttonText : {
    fontSize   : 16,
    fontWeight : 'bold',
  },
  modalOverlay : {
    flex            : 1,
    backgroundColor : 'rgba(0, 0, 0, 0.5)',
    justifyContent  : 'center',
    alignItems      : 'center',
  },
  modalContent : {
    width           : '80%',
    maxHeight       : '80%',
    backgroundColor : 'white',
    borderRadius    : 10,
    overflow        : 'hidden',
  },
  optionsContainer : {
    maxHeight : 300,
  },
  option : {
    padding           : 15,
    borderBottomWidth : 1,
    borderBottomColor : '#f0f0f0',
  },
  selectedOption : {
    backgroundColor : '#f7f7f7',
  },
  optionText : {
    fontSize : 16,
  },
  selectedOptionText : {
    fontWeight : 'bold',
  },
  modalHeader : {
    flexDirection     : 'row',
    justifyContent    : 'space-between',
    alignItems        : 'center',
    padding           : 15,
    borderBottomWidth : 1,
    borderBottomColor : '#f0f0f0',
  },
  modalTitle : {
    fontSize   : 18,
    fontWeight : 'bold',
  },
  cancelButton : {
    fontSize : 16,
    color    : '#666',
  },
})

export default Dropdown 