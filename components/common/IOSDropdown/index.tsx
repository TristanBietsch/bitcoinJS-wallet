import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActionSheetIOS,
  View,
  Platform
} from 'react-native';

type DropdownOption = {
  label: string;
  value: string;
};

type IOSDropdownProps = {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string;
  cancelButtonLabel?: string;
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
};

/**
 * iOS-native dropdown component using ActionSheetIOS
 * This will only work on iOS devices
 */
const IOSDropdown = ({ 
  options, 
  selectedValue, 
  onSelect, 
  title = 'Select an option',
  cancelButtonLabel = 'Cancel',
  backgroundColor = 'red',
  textColor = 'white',
  disabled = false
}: IOSDropdownProps) => {
  // Find the currently selected option
  const selectedOption = options.find(option => option.value === selectedValue);
  
  const showActionSheet = () => {
    if (disabled || Platform.OS !== 'ios') return;
    
    const optionLabels = options.map(option => option.label);
    const cancelButtonIndex = optionLabels.length;
    
    // Add cancel button
    optionLabels.push(cancelButtonLabel);
    
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: optionLabels,
        cancelButtonIndex,
        title,
        // Use the userInterfaceStyle to determine if the action sheet should be light or dark mode
        userInterfaceStyle: 'light',
      },
      (buttonIndex) => {
        // If cancel button wasn't pressed (which is equal to the length of our options array)
        if (buttonIndex !== cancelButtonIndex) {
          onSelect(options[buttonIndex].value);
        }
      }
    );
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor }, 
        disabled && styles.disabledButton
      ]}
      onPress={showActionSheet}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>
        {selectedOption ? selectedOption.label : title} ▼
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  disabledButton: {
    opacity: 0.6
  }
});

export default IOSDropdown; 