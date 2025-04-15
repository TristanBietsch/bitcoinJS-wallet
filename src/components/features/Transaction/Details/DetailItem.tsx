import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { fonts } from '@/src/constants/fonts'

interface DetailItemProps {
  label: string;
  value: string;
  isAddress?: boolean;
  rightElement?: React.ReactNode;
}

export const DetailItem: React.FC<DetailItemProps> = ({ 
  label, 
  value, 
  isAddress = false,
  rightElement
}) => {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text 
          style={isAddress ? styles.addressValue : styles.detailValue}
          numberOfLines={isAddress ? 1 : undefined}
          ellipsizeMode={isAddress ? "middle" : undefined}
        >
          {value}
        </Text>
        {rightElement}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  detailRow : {
    flexDirection     : 'row',
    paddingVertical   : 16,
    borderBottomWidth : 1,
    borderBottomColor : '#E0E0E0',
  },
  detailLabel : {
    flex       : 1,
    fontSize   : 16,
    color      : '#000000',
    fontWeight : '500',
  },
  valueContainer : {
    flex           : 2,
    flexDirection  : 'row',
    alignItems     : 'center',
    justifyContent : 'flex-end',
  },
  detailValue : {
    fontSize  : 16,
    color     : '#000000',
    textAlign : 'right',
  },
  addressValue : {
    fontSize   : 16,
    color      : '#000000',
    textAlign  : 'right',
    fontFamily : fonts.monospace,
  },
}) 