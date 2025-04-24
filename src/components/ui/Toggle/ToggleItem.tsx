import React from 'react'
import { View, StyleSheet, Switch } from 'react-native'
import { ThemedText } from '../Text'
import { Colors } from '@/src/constants/colors'

interface ToggleItemProps {
  text: string;
  isToggled: boolean;
  onToggle: (value: boolean) => void;
}

export const ToggleItem: React.FC<ToggleItemProps> = ({
  text,
  isToggled,
  onToggle
}) => {
  return (
    <View style={styles.warningItem}>
      <View style={styles.warningRow}>
        <View style={styles.warningTextContainer}>
          <ThemedText style={styles.warningText}>
            {text}
          </ThemedText>
        </View>
        <Switch
          value={isToggled}
          onValueChange={onToggle}
          trackColor={{ false: '#E0E0E0', true: Colors.light.successGreen }}
          thumbColor={'#FFFFFF'}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  warningItem : {
    paddingVertical : 20,
  },
  warningRow : {
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'space-between',
  },
  warningTextContainer : {
    flex        : 1,
    marginRight : 15,
  },
  warningText : {
    fontSize   : 16,
    lineHeight : 22,
  },
}) 