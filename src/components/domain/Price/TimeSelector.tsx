/**
 * Time period selector component
 * Allows users to select different timeframes for viewing Bitcoin price data
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TimeSelectorProps } from '@/src/types/price.types';

const TimeSelector: React.FC<TimeSelectorProps> = ({ 
  periods, 
  selectedPeriod, 
  onSelectPeriod 
}) => {
  return (
    <View style={styles.timeSelectorContainer} testID="time-selector">
      {periods.map((period) => (
        <TouchableOpacity
          key={period.label}
          testID={`time-option-${period.label}`}
          style={[
            styles.timeButton,
            selectedPeriod.label === period.label && styles.selectedTimeButton
          ]}
          onPress={() => onSelectPeriod(period)}
        >
          <Text
            style={[
              styles.timeButtonText,
              selectedPeriod.label === period.label && styles.selectedTimeButtonText
            ]}
          >
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  timeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  timeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectedTimeButton: {
    backgroundColor: '#F5F5F5',
  },
  timeButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  selectedTimeButtonText: {
    color: '#000000',
    fontWeight: '500',
  },
});

export default TimeSelector; 