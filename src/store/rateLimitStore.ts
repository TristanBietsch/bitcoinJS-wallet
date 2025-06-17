/**
 * Zustand store for rate limiting state management
 * Provides UI feedback and monitoring for rate limiting across the app
 */
import { create } from 'zustand'
import { rateLimitUtils } from '@/src/services/api/rateLimitedClient'

interface RateLimitStatus {
  availableTokens: number
  queueLength: number
  isProcessing: boolean
}

interface DomainStatus {
  [domain: string]: RateLimitStatus
}

interface RateLimitState {
  // State
  domainStatus: DomainStatus
  lastUpdated: number
  isMonitoring: boolean
  
  // Actions
  updateStatus: () => void
  startMonitoring: () => void
  stopMonitoring: () => void
  clearDomainQueue: (domain: string) => void
  clearAllQueues: () => void
  
  // Getters
  getTotalQueueLength: () => number
  getIsAnyDomainQueued: () => boolean
  getDomainStatus: (domain: string) => RateLimitStatus | null
}

let monitoringInterval: NodeJS.Timeout | null = null

export const useRateLimitStore = create<RateLimitState>((set, get) => ({
  // Initial state
  domainStatus : {},
  lastUpdated  : 0,
  isMonitoring : false,

  // Update rate limiting status from the rate limiter
  updateStatus : () => {
    try {
      const status = rateLimitUtils.getStatus()
      set({
        domainStatus : status,
        lastUpdated  : Date.now()
      })
    } catch (error) {
      console.error('Failed to update rate limit status:', error)
    }
  },

  // Start monitoring rate limiting status
  startMonitoring : () => {
    const state = get()
    if (state.isMonitoring) return

    // Update immediately
    state.updateStatus()

    // Set up periodic updates
    monitoringInterval = setInterval(() => {
      state.updateStatus()
    }, 1000) // Update every second

    set({ isMonitoring: true })
  },

  // Stop monitoring
  stopMonitoring : () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }
    set({ isMonitoring: false })
  },

  // Clear queue for a specific domain
  clearDomainQueue : (domain: string) => {
    try {
      rateLimitUtils.clearDomainQueue(domain)
      get().updateStatus() // Refresh status after clearing
    } catch (error) {
      console.error(`Failed to clear queue for domain ${domain}:`, error)
    }
  },

  // Clear all queues
  clearAllQueues : () => {
    try {
      rateLimitUtils.clearAllQueues()
      get().updateStatus() // Refresh status after clearing
    } catch (error) {
      console.error('Failed to clear all queues:', error)
    }
  },

  // Get total queue length across all domains
  getTotalQueueLength : () => {
    const { domainStatus } = get()
    return Object.values(domainStatus).reduce(
      (total, status) => total + status.queueLength,
      0
    )
  },

  // Check if any domain has queued requests
  getIsAnyDomainQueued : () => {
    const { domainStatus } = get()
    return Object.values(domainStatus).some(status => status.queueLength > 0)
  },

  // Get status for a specific domain
  getDomainStatus : (domain: string) => {
    const { domainStatus } = get()
    return domainStatus[domain] || null
  }
}))

/**
 * Helper hook for components that need basic rate limit info
 */
export const useRateLimitInfo = () => {
  const store = useRateLimitStore()
  
  return {
    totalQueued  : store.getTotalQueueLength(),
    isAnyQueued  : store.getIsAnyDomainQueued(),
    isMonitoring : store.isMonitoring,
    lastUpdated  : store.lastUpdated
  }
}

/**
 * Helper hook for domain-specific rate limit status
 */
export const useDomainRateLimit = (domain: string) => {
  const store = useRateLimitStore()
  
  return {
    status     : store.getDomainStatus(domain),
    clearQueue : () => store.clearDomainQueue(domain)
  }
} 