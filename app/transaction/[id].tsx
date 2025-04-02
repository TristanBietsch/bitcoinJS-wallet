import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { ThemedText } from '@/src/components/common/ThemedText'
import { ThemedView } from '@/src/components/common/ThemedView'
import { ChevronLeft } from 'lucide-react-native'

// Mock data - this will be replaced with real data later
const mockTransaction = {
  id          : '1',
  amount      : '100.00',
  type        : 'SEND',
  date        : '2024-03-10',
  status      : 'COMPLETED',
  recipient   : '0x1234...5678',
  description : 'Test transaction',
}

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  // This will be replaced with real data fetching logic
  const transaction = mockTransaction

  const handleBackPress = () => {
    router.back()
  }

  return (
    <ThemedView style={styles.container}>
      {/* Custom Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <ChevronLeft size={24} color="black" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <ThemedText type="title">Transaction {id}</ThemedText>
        <ThemedView style={styles.detailsContainer}>
          <ThemedText>Amount: {transaction.amount}</ThemedText>
          <ThemedText>Type: {transaction.type}</ThemedText>
          <ThemedText>Date: {transaction.date}</ThemedText>
          <ThemedText>Status: {transaction.status}</ThemedText>
          <ThemedText>Recipient: {transaction.recipient}</ThemedText>
          <ThemedText>Description: {transaction.description}</ThemedText>
        </ThemedView>
      </View>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex    : 1,
    padding : 0,
  },
  contentContainer : {
    flex       : 1,
    alignItems : 'center',
    padding    : 20,
    paddingTop : 80,
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
    alignItems     : 'center',
  },
  detailsContainer : {
    width     : '100%',
    marginTop : 20,
    gap       : 10,
  },
}) 