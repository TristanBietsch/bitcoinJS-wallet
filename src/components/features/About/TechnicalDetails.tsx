import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Info } from 'lucide-react-native'
import SectionContainer from './SectionContainer'
import '@/src/types/@types/about.d.ts'

interface DetailRowProps {
  label: string
  value: string
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}</ThemedText>
      <ThemedText style={styles.detailValue}>{value}</ThemedText>
    </View>
  )
}

const TechnicalDetails: React.FC<About.TechnicalDetailsData> = ({ 
  network, 
  platform, 
  version 
}) => {
  return (
    <SectionContainer 
      icon={<Info size={20} color="#000" />}
      title="Technical Details"
    >
      <DetailRow label="Network" value={network} />
      <DetailRow label="Running On" value={platform} />
      <DetailRow label="Wallet Version" value={version} />
    </SectionContainer>
  )
}

const styles = StyleSheet.create({
  detailRow : {
    flexDirection     : 'row',
    justifyContent    : 'space-between',
    paddingVertical   : 12,
    borderBottomWidth : 1,
    borderBottomColor : '#EEEEEE'
  },
  detailLabel : {
    fontSize : 16,
    color    : '#666666'
  },
  detailValue : {
    fontSize   : 16,
    fontWeight : '500'
  }
})

export default TechnicalDetails 