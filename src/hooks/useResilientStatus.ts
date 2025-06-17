/**
 * React hook for monitoring resilient client status
 * Provides circuit breaker status and API health information
 */
import { useState, useEffect, useCallback } from 'react'
import { resilientUtils } from '@/src/services/api/resilientClient'

interface CircuitBreakerStatus {
  isOpen: boolean
  failures: number
  nextAttemptTime: number
}

interface ResilientStatus {
  circuitBreakers: Record<string, CircuitBreakerStatus>
  hasOpenCircuits: boolean
  mostFailedDomain: string | null
  lastUpdated: number
}

/**
 * Hook to monitor circuit breaker status and API health
 */
export const useResilientStatus = (shouldMonitor = false) => {
  const [ status, setStatus ] = useState<ResilientStatus>({
    circuitBreakers  : {},
    hasOpenCircuits  : false,
    mostFailedDomain : null,
    lastUpdated      : 0
  })

  const updateStatus = useCallback(() => {
    try {
      const circuitBreakers = resilientUtils.getCircuitStatus()
      const hasOpenCircuits = Object.values(circuitBreakers).some(
        (circuit: any) => circuit.isOpen
      )
      
      // Find domain with most failures
      let mostFailedDomain = null
      let maxFailures = 0
      for (const [ domain, circuit ] of Object.entries(circuitBreakers)) {
        if ((circuit as any).failures > maxFailures) {
          maxFailures = (circuit as any).failures
          mostFailedDomain = domain
        }
      }
      
      setStatus({
        circuitBreakers,
        hasOpenCircuits,
        mostFailedDomain,
        lastUpdated : Date.now()
      })
    } catch (error) {
      console.error('Failed to update resilient client status:', error)
    }
  }, [])

  useEffect(() => {
    if (!shouldMonitor) return

    // Update immediately
    updateStatus()

    // Set up periodic updates
    const interval = setInterval(updateStatus, 5000) // Every 5 seconds

    return () => clearInterval(interval)
  }, [ shouldMonitor, updateStatus ])

  const resetCircuit = useCallback((domain: string) => {
    try {
      resilientUtils.resetCircuit(domain)
      updateStatus()
    } catch (error) {
      console.error(`Failed to reset circuit for domain ${domain}:`, error)
    }
  }, [ updateStatus ])

  const clearAll = useCallback(() => {
    try {
      resilientUtils.clearAll()
      updateStatus()
    } catch (error) {
      console.error('Failed to clear all resilient client state:', error)
    }
  }, [ updateStatus ])

  return {
    ...status,
    updateStatus,
    resetCircuit,
    clearAll
  }
}

/**
 * Hook for simple API health feedback in wallet operations
 */
export const useApiHealth = () => {
  const { hasOpenCircuits, mostFailedDomain, circuitBreakers } = useResilientStatus(true)

  const getHealthMessage = useCallback(() => {
    if (!hasOpenCircuits) return null
    
    if (mostFailedDomain) {
      return `API issues detected with ${mostFailedDomain}. Using cached data and retrying automatically.`
    }
    
    return 'Some APIs are experiencing issues. Using cached data when available.'
  }, [ hasOpenCircuits, mostFailedDomain ])

  const getHealthStatus = useCallback(() => {
    if (!hasOpenCircuits) return 'healthy'
    
    const openCircuits = Object.values(circuitBreakers).filter(
      (circuit: any) => circuit.isOpen
    ).length
    
    if (openCircuits === 1) return 'degraded'
    return 'critical'
  }, [ hasOpenCircuits, circuitBreakers ])

  return {
    isHealthy      : !hasOpenCircuits,
    status         : getHealthStatus(),
    message        : getHealthMessage(),
    hasIssues      : hasOpenCircuits,
    affectedDomain : mostFailedDomain
  }
}

/**
 * Hook for detailed circuit breaker information (for debugging)
 */
export const useCircuitBreakers = () => {
  const { circuitBreakers, resetCircuit, clearAll } = useResilientStatus(true)
  
  const getCircuitInfo = useCallback((domain: string) => {
    const circuit = circuitBreakers[domain]
    if (!circuit) return null
    
    return {
      isOpen            : circuit.isOpen,
      failures          : circuit.failures,
      nextAttemptTime   : circuit.nextAttemptTime,
      timeToNextAttempt : circuit.isOpen 
        ? Math.max(0, circuit.nextAttemptTime - Date.now())
        : 0
    }
  }, [ circuitBreakers ])
  
  return {
    circuitBreakers,
    getCircuitInfo,
    resetCircuit,
    clearAll
  }
} 