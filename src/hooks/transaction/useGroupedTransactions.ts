import { useMemo } from 'react'
import { Transaction } from '@/src/types/domain/transaction/transaction.types'
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
    // Sort transactions by date (newest first)
    const sortedTransactions = [ ...transactions ].sort((a, b) => {
      const timestampA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()
      const timestampB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime()
      return timestampB - timestampA
    })
    
    // Group by time periods
    const today: Transaction[] = []
    const pastWeek: Transaction[] = []
    const monthGroups: { [key: string]: Transaction[] } = {}
    
    sortedTransactions.forEach(transaction => {
      // Convert date to timestamp for helper functions
      const timestamp = transaction.date instanceof Date 
        ? transaction.date.getTime() 
        : new Date(transaction.date).getTime()
      
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