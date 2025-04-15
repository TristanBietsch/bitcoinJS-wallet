import React from 'react'
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft, ExternalLink } from 'lucide-react-native'

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.backButton} onPress={onPress}>
    <ChevronLeft size={24} color="black" />
  </TouchableOpacity>
)

const StatusIcon = () => (
  <View style={styles.statusIconContainer}>
    <View style={styles.statusIcon}>
      <Text style={styles.checkmark}>✓</Text>
    </View>
    <Text style={styles.statusText}>Sent</Text>
  </View>
)

const TransactionField = ({ label, value, subValue, isAddress = false }: {
  label: string
  value: string | number
  subValue?: string
  isAddress?: boolean
}) => (
  <View style={styles.field}>
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueWrapper}>
        <Text style={[ styles.fieldValue, isAddress && styles.addressText ]}>{value}</Text>
        {subValue && <Text style={styles.subValue}>{subValue}</Text>}
      </View>
    </View>
  </View>
)

const MempoolButton = () => (
  <TouchableOpacity style={styles.mempoolButton}>
    <Text style={styles.mempoolButtonText}>View on Mempool</Text>
    <ExternalLink size={16} color="#000" />
  </TouchableOpacity>
)

export default function TransactionDetailsScreen() {
  const router = useRouter()
  
  const handleBackPress = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <BackButton onPress={handleBackPress} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <StatusIcon />
          
          <View style={styles.detailsContainer}>
            <TransactionField 
              label="Amount" 
              value="10000 sats"
              subValue="= $2.37 USD"
            />
            
            <TransactionField 
              label="To address" 
              value="b3289asjklasdfasdlfjasdfj8f7uas8987f89asd7f89asdfasdff7asduf89asdfas0×84"
              isAddress
            />
            
            <TransactionField 
              label="Fee" 
              value="100 sats"
              subValue="xxxx sat/vbyte"
            />
            
            <TransactionField 
              label="Total" 
              value="10100 sats"
              subValue="= 3.37 USD"
            />
          </View>
          
          <MempoolButton />
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#FFFFFF'
  },
  backButton : {
    position       : 'absolute',
    top            : 70,
    left           : 16,
    zIndex         : 10,
    width          : 40,
    height         : 40,
    borderRadius   : 20,
    justifyContent : 'center',
    alignItems     : 'center'
  },
  scrollView : {
    flex      : 1,
    marginTop : 70,
  },
  content : {
    flex              : 1,
    alignItems        : 'center',
    paddingHorizontal : 20,
    paddingTop        : 40,
  },
  statusIconContainer : {
    alignItems   : 'center',
    marginBottom : 40,
  },
  statusIcon : {
    width           : 64,
    height          : 64,
    borderRadius    : 32,
    backgroundColor : '#4CAF50',
    justifyContent  : 'center',
    alignItems      : 'center',
    marginBottom    : 16,
  },
  checkmark : {
    color    : '#FFFFFF',
    fontSize : 32,
  },
  statusText : {
    fontSize   : 24,
    fontWeight : '600',
  },
  detailsContainer : {
    width             : '100%',
    marginBottom      : 40,
    paddingHorizontal : 16,
  },
  field : {
    marginBottom : 32,
    width        : '100%',
  },
  fieldRow : {
    flexDirection  : 'row',
    alignItems     : 'flex-start',
    justifyContent : 'space-between',
    gap            : 20,
  },
  fieldLabel : {
    fontSize   : 16,
    color      : '#666666',
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
  },
  addressText : {
    fontSize   : 14,
    width      : '100%',
    flexWrap   : 'wrap',
    lineHeight : 20,
  },
  subValue : {
    fontSize  : 14,
    color     : '#666666',
    marginTop : 4,
    textAlign : 'right',
    opacity   : 0.8,
  },
  mempoolButton : {
    flexDirection   : 'row',
    alignItems      : 'center',
    gap             : 8,
    paddingVertical : 12,
  },
  mempoolButtonText : {
    fontSize   : 16,
    fontWeight : '500',
  },
}) 