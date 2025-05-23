/**
 * React hook for rate limiting status and UI feedback
 * Provides simple interface for components to show rate limiting information
 */
import { useState, useEffect, useCallback } from 'react'
import { rateLimitUtils } from '@/src/services/api/rateLimitedClient'

interface RateLimitInfo {
  totalQueued: number
  isAnyQueued: boolean
  domainStatus: Record<string, any>
  lastUpdated: number
}

/**
 * Hook to monitor rate limiting status across all domains
 */
export const useRateLimitStatus = (shouldMonitor = false) => {
  const [ status, setStatus ] = useState<RateLimitInfo>({
    totalQueued  : 0,
    isAnyQueued  : false,
    domainStatus : {},
    lastUpdated  : 0
  })

  const updateStatus = useCallback(() => {
    try {
      const domainStatus = rateLimitUtils.getStatus()
      const totalQueued = Object.values(domainStatus).reduce(
        (total: number, domain: any) => total + (domain.queueLength || 0),
        0
      )
      
      setStatus({
        totalQueued,
        isAnyQueued : totalQueued > 0,
        domainStatus,
        lastUpdated : Date.now()
      })
    } catch (error) {
      console.error('Failed to update rate limit status:', error)
    }
  }, [])

  useEffect(() => {
    if (!shouldMonitor) return

    // Update immediately
    updateStatus()

    // Set up periodic updates
    const interval = setInterval(updateStatus, 2000) // Every 2 seconds

    return () => clearInterval(interval)
  }, [ shouldMonitor, updateStatus ])

  const clearAllQueues = useCallback(() => {
    try {
      rateLimitUtils.clearAllQueues()
      updateStatus()
    } catch (error) {
      console.error('Failed to clear all queues:', error)
    }
  }, [ updateStatus ])

  return {
    ...status,
    updateStatus,
    clearAllQueues
  }
}

/**
 * Hook for simple rate limiting feedback in wallet operations
 */
export const useWalletRateLimit = () => {
  const { totalQueued, isAnyQueued } = useRateLimitStatus(true)

  const getMessage = useCallback(() => {
    if (!isAnyQueued) return null
    
    if (totalQueued === 1) {
      return 'Processing API request...'
    }
    
    return `Processing ${totalQueued} API requests...`
  }, [ totalQueued, isAnyQueued ])

  const shouldShowSpinner = isAnyQueued

  return {
    isQueued   : isAnyQueued,
    queueCount : totalQueued,
    message    : getMessage(),
    shouldShowSpinner
  }
} 