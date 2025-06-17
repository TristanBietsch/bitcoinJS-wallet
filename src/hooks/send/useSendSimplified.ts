import { useState, useCallback } from 'react'
import { SendService, SendInputs, SendResult } from '@/src/services/send'

interface UseSendState {
  isLoading: boolean
  error: string | null
  result: SendResult | null
}

/**
 * Simplified send hook that uses the new SendService
 * Replaces the complex send store and multiple hooks
 */
export function useSendSimplified() {
  const [ state, setState ] = useState<UseSendState>({
    isLoading : false,
    error     : null,
    result    : null
  })

  const validateInputs = useCallback((inputs: SendInputs) => {
    return SendService.validateInputs(inputs)
  }, [])

  const prepareTransaction = useCallback(async (inputs: SendInputs) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const preparation = await SendService.prepareTransaction(inputs)
      setState(prev => ({ ...prev, isLoading: false }))
      return preparation
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to prepare transaction'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const executeTransaction = useCallback(async (inputs: SendInputs) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, result: null }))
    
    try {
      const result = await SendService.executeTransaction(inputs)
      setState(prev => ({ ...prev, isLoading: false, result }))
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isLoading : false,
      error     : null,
      result    : null
    })
  }, [])

  return {
    // State
    isLoading : state.isLoading,
    error     : state.error,
    result    : state.result,
    
    // Actions
    validateInputs,
    prepareTransaction,
    executeTransaction,
    reset
  }
} 