/**
 * Hook for managing timeframe selection with debounce
 */
import { useState, useCallback } from 'react'
import { TimeframePeriod } from '@/src/types/domain/finance'

interface TimeframeSelectorResult {
  selectedPeriod: TimeframePeriod
  isChangingPeriod: boolean
  handlePeriodChange: (period: TimeframePeriod) => void
}

/**
 * Custom hook for managing timeframe selection with debounce
 * @param initialPeriod - The initial period to select
 * @param debounceMs - Debounce time in milliseconds (default: 300ms)
 */
export const useTimeframeSelector = (
  initialPeriod: TimeframePeriod,
  debounceMs = 300
): TimeframeSelectorResult => {
  // State for selected time period
  const [ selectedPeriod, setSelectedPeriod ] = useState<TimeframePeriod>(initialPeriod)
  
  // Add loading state handler to prevent rapid switching
  const [ isChangingPeriod, setIsChangingPeriod ] = useState(false)
  
  // Handler for period changes with debounce
  const handlePeriodChange = useCallback((period: TimeframePeriod) => {
    setIsChangingPeriod(true)
    setSelectedPeriod(period)
    
    // Reset changing state after a delay
    setTimeout(() => {
      setIsChangingPeriod(false)
    }, debounceMs)
  }, [ debounceMs ])
  
  return {
    selectedPeriod,
    isChangingPeriod,
    handlePeriodChange
  }
} 