import React, { useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { ActivityGroup } from '@/src/components/features/Transaction/List/ActivityGroup'
import { Transaction, mockTransactions } from '@/tests/mockData/transactionData'
import { useRouter } from 'expo-router'
import { fonts } from '@/src/constants/fonts'
import { isToday, isThisWeek, getMonthYear } from '../../../utils/helpers/dateHelpers'

// Component to display a section divider
const SectionDivider = () => (
  <View style={styles.sectionDivider} />
)

export default function ActivityScreen() {
  const router = useRouter()
  
  // Group transactions by time periods
  const groupedTransactions = useMemo(() => {
    // In a real app, you would fetch this data from an API or state management store
    // For now, we're using the mock data directly
    const transactions = mockTransactions
    
    // Sort transactions by timestamp (newest first)
    const sortedTransactions = [ ...transactions ].sort((a, b) => b.timestamp - a.timestamp)
    
    // Group by time periods
    const today: Transaction[] = []
    const pastWeek: Transaction[] = []
    const monthGroups: { [key: string]: Transaction[] } = {}
    
    sortedTransactions.forEach(transaction => {
      if (isToday(transaction.timestamp)) {
        today.push(transaction)
      } else if (isThisWeek(transaction.timestamp)) {
        pastWeek.push(transaction)
      } else {
        const monthYear = getMonthYear(transaction.timestamp)
        if (!monthGroups[monthYear]) {
          monthGroups[monthYear] = []
        }
        monthGroups[monthYear].push(transaction)
      }
    })
    
    return {
      today,
      pastWeek,
      monthGroups
    }
  }, [])
  
  const handlePressTransaction = (transaction: Transaction) => {
    // Navigate to transaction details screen using Expo Router
    router.push({
      pathname : '/transaction/[id]',
      params   : { id: transaction.id }
    } as any)
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Activity
        </ThemedText>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {groupedTransactions.today.length > 0 && (
          <>
            <ActivityGroup
              title="Today"
              transactions={groupedTransactions.today}
              onPressTransaction={handlePressTransaction}
            />
            {(groupedTransactions.pastWeek.length > 0 || 
              Object.keys(groupedTransactions.monthGroups).length > 0) && <SectionDivider />}
          </>
        )}
        
        {groupedTransactions.pastWeek.length > 0 && (
          <>
            <ActivityGroup
              title="Past Week"
              transactions={groupedTransactions.pastWeek}
              onPressTransaction={handlePressTransaction}
            />
            {Object.keys(groupedTransactions.monthGroups).length > 0 && <SectionDivider />}
          </>
        )}
        
        {/* Render month groups */}
        {Object.entries(groupedTransactions.monthGroups).map(([ monthYear, transactions ], index, array) => (
          <React.Fragment key={monthYear}>
            <ActivityGroup
              title={monthYear}
              transactions={transactions}
              onPressTransaction={handlePressTransaction}
            />
            {index < array.length - 1 && <SectionDivider />}
          </React.Fragment>
        ))}
        
        {/* Bottom spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#FFFFFF',
  },
  header : {
    paddingHorizontal : 16,
    paddingTop        : 78,
    paddingBottom     : 16,
    backgroundColor   : '#FFFFFF',
  },
  headerTitle : {
    fontSize   : 28,
    fontFamily : fonts.bold,
    textAlign  : 'center',
  },
  scrollView : {
    flex : 1,
  },
  scrollViewContent : {
    paddingTop : 16,
  },
  sectionDivider : {
    height           : 1,
    backgroundColor  : '#E0E0E0',
    marginVertical   : 16,
    marginHorizontal : 16,
  },
  bottomSpacer : {
    height : 80, // Increased height to ensure enough space at bottom
  },
}) 