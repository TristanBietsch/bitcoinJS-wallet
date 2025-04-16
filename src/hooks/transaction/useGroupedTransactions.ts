import { useMemo } from 'react'
import { Transaction } from '@/tests/mockData/transactionData'
import { isToday, isThisWeek, getMonthYear } from '@/src/utils/helpers/dateHelpers'

interface GroupedTransactions {
  today: Transaction[]
  pastWeek: Transaction[]
  monthGroups: { [key: string]: Transaction[] }
}

/**
 * Hook to group transactions by time periods (today, past week, and by month/year)
 * @param transactions Array of transactions to group
 * @returns Grouped transactions object with today, pastWeek, and monthGroups
 */
export const useGroupedTransactions = (transactions: Transaction[]): GroupedTransactions => {
  return useMemo(() => {
    // Sort transactions by timestamp (newest first)
    const sortedTransactions = [ ...transactions ].sort((a, b) => {
      return b.timestamp - a.timestamp
    })
    
    // Group by time periods
    const today: Transaction[] = []
    const pastWeek: Transaction[] = []
    const monthGroups: { [key: string]: Transaction[] } = {}
    
    sortedTransactions.forEach(transaction => {
      const timestamp = transaction.timestamp
      
      if (isToday(timestamp)) {
        today.push(transaction)
      } else if (isThisWeek(timestamp)) {
        pastWeek.push(transaction)
      } else {
        const monthYear = getMonthYear(timestamp)
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
  }, [ transactions ])
} 