/**
 * Rate limiting configuration for different API domains
 */
import { RateLimitConfig } from '@/src/services/api/rateLimiter'

export interface DomainConfig {
  [domain: string]: RateLimitConfig
}

/**
 * Production rate limiting configuration
 * Based on API provider documentation and best practices
 */
export const PRODUCTION_RATE_LIMITS: DomainConfig = {
  // Blockstream Esplora API - Conservative limits to avoid 429s
  'blockstream.info' : {
    requestsPerSecond : 1,     // 1 request per second
    burstLimit        : 3,            // Allow burst of 3 requests
    queueLimit        : 25            // Queue up to 25 requests
  },
  
  // Mempool.space API - More permissive
  'mempool.space' : {
    requestsPerSecond : 2,     // 2 requests per second  
    burstLimit        : 5,            // Allow burst of 5 requests
    queueLimit        : 30            // Queue up to 30 requests
  },
  
  // Supabase backend - Higher limits for our own backend
  'supabase' : {
    requestsPerSecond : 5,     // 5 requests per second
    burstLimit        : 10,           // Allow burst of 10 requests
    queueLimit        : 50            // Queue up to 50 requests
  },
  
  // Analytics services - Lower priority, more restrictive
  'analytics' : {
    requestsPerSecond : 1,     // 1 request per second
    burstLimit        : 2,            // Small burst limit
    queueLimit        : 100           // Large queue for analytics events
  },
  
  // Default for unknown domains
  'default' : {
    requestsPerSecond : 2,
    burstLimit        : 5,
    queueLimit        : 20
  }
}

/**
 * Development rate limiting configuration
 * More permissive for testing and development
 */
export const DEVELOPMENT_RATE_LIMITS: DomainConfig = {
  'blockstream.info' : {
    requestsPerSecond : 5,
    burstLimit        : 10,
    queueLimit        : 50
  },
  
  'mempool.space' : {
    requestsPerSecond : 10,
    burstLimit        : 20,
    queueLimit        : 100
  },
  
  'supabase' : {
    requestsPerSecond : 20,
    burstLimit        : 50,
    queueLimit        : 200
  },
  
  'analytics' : {
    requestsPerSecond : 10,
    burstLimit        : 20,
    queueLimit        : 500
  },
  
  'default' : {
    requestsPerSecond : 10,
    burstLimit        : 20,
    queueLimit        : 100
  }
}

/**
 * Emergency rate limiting configuration
 * Very restrictive limits for when APIs are having issues
 */
export const EMERGENCY_RATE_LIMITS: DomainConfig = {
  'blockstream.info' : {
    requestsPerSecond : 0.5,   // 1 request every 2 seconds
    burstLimit        : 1,            // No burst allowed
    queueLimit        : 10            // Very small queue
  },
  
  'mempool.space' : {
    requestsPerSecond : 0.5,
    burstLimit        : 1,
    queueLimit        : 10
  },
  
  'supabase' : {
    requestsPerSecond : 1,
    burstLimit        : 2,
    queueLimit        : 20
  },
  
  'analytics' : {
    requestsPerSecond : 0.2,   // 1 request every 5 seconds
    burstLimit        : 1,
    queueLimit        : 50
  },
  
  'default' : {
    requestsPerSecond : 0.5,
    burstLimit        : 1,
    queueLimit        : 10
  }
}

/**
 * Extract domain from URL for rate limiting
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname
    
    // Map specific hostnames to our rate limit categories
    if (hostname.includes('blockstream.info')) {
      return 'blockstream.info'
    }
    if (hostname.includes('mempool.space')) {
      return 'mempool.space'
    }
    if (hostname.includes('supabase')) {
      return 'supabase'
    }
    
    // For analytics or other services, you might want to add more specific mappings
    return hostname
  } catch (error) {
    console.warn('Failed to parse URL for rate limiting:', url, error)
    return 'default'
  }
}

/**
 * Get the appropriate rate limit configuration based on environment
 */
export function getRateLimitConfig(): DomainConfig {
  if (__DEV__) {
    return DEVELOPMENT_RATE_LIMITS
  }
  
  // You could add logic here to switch to EMERGENCY_RATE_LIMITS
  // based on user settings or API health status
  return PRODUCTION_RATE_LIMITS
} 