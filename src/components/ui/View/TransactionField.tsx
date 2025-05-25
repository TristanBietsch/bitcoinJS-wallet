import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ArrowRight } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'

interface TransactionFieldProps {
  label: string
  value: string | number
  subValue?: string
  isAddress?: boolean
  showArrow?: boolean
  accessibilityLabel?: string
}

export const TransactionField = ({ 
  label, 
  value, 
  subValue, 
  isAddress = false, 
  showArrow = false, 
  accessibilityLabel 
}: TransactionFieldProps) => (
  <View style={styles.field}>
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueWrapper}>
        <View style={styles.valueRow}>
          <Text 
            style={[ styles.fieldValue, isAddress && styles.addressText ]}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="text"
          >
            {value}
          </Text>
          {showArrow && <ArrowRight size={16} color={Colors.light.text} style={styles.arrowIcon} />}
        </View>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  field : {
    marginBottom : 40,
    width        : '100%',
  },
  fieldRow : {
    flexDirection  : 'row',
    alignItems     : 'flex-start',
    justifyContent : 'space-between',
    gap            : 20,
  },
  valueRow : {
    flexDirection : 'row',
    alignItems    : 'center',
    gap           : 4,
  },
  arrowIcon : {
    marginLeft : 4,
  },
  fieldLabel : {
    fontSize   : 16,
    color      : Colors.light.icon,
    flex       : 1,
    paddingTop : 4,
  },
  fieldValueWrapper : {
    flex       : 2,
    alignItems : 'flex-end',
  },
  fieldValue : {
    fontSize   : 18,
    fontWeight : '500',
    textAlign  : 'right',
    lineHeight : 24,
    color      : Colors.light.text,
  },
  addressText : {
    fontSize   : 14,
    width      : '100%',
    flexWrap   : 'wrap',
    lineHeight : 20,
  },
  subValue : {
    fontSize  : 14,
    color     : Colors.light.icon,
    marginTop : 4,
    textAlign : 'right',
    opacity   : 0.8,
  },
}) 