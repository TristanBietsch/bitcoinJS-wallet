/**
 * Rate-limited API client with domain-aware throttling
 * Replaces direct axios usage with intelligent rate limiting
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { rateLimiter, RequestPriority } from './rateLimiter'
import { extractDomain, getRateLimitConfig } from '@/src/config/rateLimitConfig'

// Initialize rate limiter with configuration
const setupRateLimiter = () => {
  const config = getRateLimitConfig()
  
  // Configure rate limits for each domain
  Object.entries(config).forEach(([ domain, rateLimitConfig ]) => {
    rateLimiter.configure(domain, rateLimitConfig)
  })
}

// Setup rate limiter on module load
setupRateLimiter()

/**
 * Enhanced axios instance with default configuration
 */
const axiosInstance: AxiosInstance = axios.create({
  timeout : 15000, // 15 second timeout
  headers : {
    'Content-Type' : 'application/json'
  }
})

/**
 * Request interceptor for logging and configuration
 */
axiosInstance.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

/**
 * Response interceptor for error handling and rate limit detection
 */
axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 429) {
      console.warn('Rate limit detected:', error.config.url)
      // Could implement additional logic here for 429 handling
    }
    
    if (error.response?.status >= 500) {
      console.error('Server error detected:', error.config.url, error.response?.status)
    }
    
    return Promise.reject(error)
  }
)

/**
 * Execute HTTP request with rate limiting
 */
async function executeRequest<T = any>(
  requestFn: () => Promise<AxiosResponse<T>>,
  url: string,
  priority: RequestPriority = RequestPriority.NORMAL
): Promise<T> {
  const domain = extractDomain(url)
  
  try {
    const response = await rateLimiter.execute(
      domain,
      requestFn,
      priority
    )
    return response.data
  } catch (error) {
    // Enhanced error logging with domain context
    if (axios.isAxiosError(error)) {
      console.error(`API Error [${domain}]:`, {
        url,
        status  : error.response?.status,
        message : error.message,
        data    : error.response?.data
      })
    } else {
      console.error(`Request Error [${domain}]:`, error)
    }
    throw error
  }
}

/**
 * Rate-limited API client with all HTTP methods
 */
export const rateLimitedApiClient = {
  /**
   * GET request with rate limiting
   */
  get : async <T = any>(
    url: string, 
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> => {
    const requestFn = () => axiosInstance.get<T>(url, config)
    return executeRequest(requestFn, url, priority)
  },
  
  /**
   * POST request with rate limiting
   */
  post : async <T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> => {
    const requestFn = () => axiosInstance.post<T>(url, data, config)
    return executeRequest(requestFn, url, priority)
  },
  
  /**
   * PUT request with rate limiting
   */
  put : async <T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> => {
    const requestFn = () => axiosInstance.put<T>(url, data, config)
    return executeRequest(requestFn, url, priority)
  },
  
  /**
   * DELETE request with rate limiting
   */
  delete : async <T = any>(
    url: string, 
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> => {
    const requestFn = () => axiosInstance.delete<T>(url, config)
    return executeRequest(requestFn, url, priority)
  },
  
  /**
   * PATCH request with rate limiting
   */
  patch : async <T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> => {
    const requestFn = () => axiosInstance.patch<T>(url, data, config)
    return executeRequest(requestFn, url, priority)
  }
}

/**
 * Specialized methods for different priority levels
 */
export const priorityApiClient = {
  /**
   * Critical requests (transaction broadcasting, urgent operations)
   */
  critical : {
    get : <T = any>(url: string, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.get<T>(url, config, RequestPriority.CRITICAL),
    post : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.post<T>(url, data, config, RequestPriority.CRITICAL),
    put : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.put<T>(url, data, config, RequestPriority.CRITICAL),
    delete : <T = any>(url: string, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.delete<T>(url, config, RequestPriority.CRITICAL),
  },
  
  /**
   * High priority requests (user-initiated actions)
   */
  high : {
    get : <T = any>(url: string, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.get<T>(url, config, RequestPriority.HIGH),
    post : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.post<T>(url, data, config, RequestPriority.HIGH),
    put : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.put<T>(url, data, config, RequestPriority.HIGH),
    delete : <T = any>(url: string, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.delete<T>(url, config, RequestPriority.HIGH),
  },
  
  /**
   * Low priority requests (analytics, background operations)
   */
  low : {
    get : <T = any>(url: string, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.get<T>(url, config, RequestPriority.LOW),
    post : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.post<T>(url, data, config, RequestPriority.LOW),
    put : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.put<T>(url, data, config, RequestPriority.LOW),
    delete : <T = any>(url: string, config?: AxiosRequestConfig) => 
      rateLimitedApiClient.delete<T>(url, config, RequestPriority.LOW),
  }
}

/**
 * Utility functions for monitoring and debugging
 */
export const rateLimitUtils = {
  /**
   * Get current rate limiting status for all domains
   */
  getStatus : () => rateLimiter.getAllStatus(),
  
  /**
   * Get status for a specific domain
   */
  getDomainStatus : (domain: string) => rateLimiter.getStatus(domain),
  
  /**
   * Clear queues for emergency situations
   */
  clearAllQueues : () => rateLimiter.clearAllQueues(),
  
  /**
   * Clear queue for specific domain
   */
  clearDomainQueue : (domain: string) => rateLimiter.clearQueue(domain),
  
  /**
   * Reconfigure rate limiter (useful for emergency mode)
   */
  reconfigure : () => setupRateLimiter()
}

// Export the main client as default
export default rateLimitedApiClient 