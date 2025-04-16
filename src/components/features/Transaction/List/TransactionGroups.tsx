import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Transaction } from '@/tests/mockData/transactionData'
import { ActivityGroup } from './ActivityGroup'
import { SectionDivider } from '@/src/components/ui/Divider/SectionDivider'

interface TransactionGroupsProps {
  groupedTransactions: {
    today: Transaction[]
    pastWeek: Transaction[]
    monthGroups: { [key: string]: Transaction[] }
  }
  onPressTransaction: (transaction: Transaction) => void
}

/**
 * Component for rendering grouped transaction lists
 */
export const TransactionGroups = ({ 
  groupedTransactions, 
  onPressTransaction 
}: TransactionGroupsProps) => {
  return (
    <View style={styles.container}>
      {groupedTransactions.today.length > 0 && (
        <>
          <ActivityGroup
            title="Today"
            transactions={groupedTransactions.today}
            onPressTransaction={onPressTransaction}
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
            onPressTransaction={onPressTransaction}
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
            onPressTransaction={onPressTransaction}
          />
          {index < array.length - 1 && <SectionDivider />}
        </React.Fragment>
      ))}
      
      {/* Bottom spacer */}
      <View style={styles.bottomSpacer} />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1
  },
  bottomSpacer : {
    height : 80 // Increased height to ensure enough space at bottom
  }
})

export default TransactionGroups 