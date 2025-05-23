/**
 * Resilient API Client with retry, deduplication, circuit breaking, and fallbacks
 * Replaces the rate limiting approach with a more robust solution
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

export enum RequestPriority {
  LOW = 0,      // Analytics, background operations
  NORMAL = 1,   // Regular wallet operations  
  HIGH = 2,     // User-initiated actions
  CRITICAL = 3  // Transaction broadcasting
}

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  timeoutMs: number
}

interface CircuitBreakerState {
  failures: number
  lastFailureTime: number
  isOpen: boolean
  nextAttemptTime: number
}

interface PendingRequest {
  promise: Promise<any>
  timestamp: number
  abortController: AbortController
}

/**
 * Resilient HTTP client with intelligent retry and fallback strategies
 */
class ResilientHttpClient {
  private axiosInstance: AxiosInstance
  private circuitBreakers = new Map<string, CircuitBreakerState>()
  private pendingRequests = new Map<string, PendingRequest>()
  private requestCache = new Map<string, { data: any; timestamp: number }>()
  
  // Configuration for different priority levels
  private retryConfigs: Record<RequestPriority, RetryConfig> = {
    [RequestPriority.CRITICAL] : {
      maxRetries        : 5,
      baseDelay         : 500,
      maxDelay          : 5000,
      backoffMultiplier : 1.5,
      timeoutMs         : 30000
    },
    [RequestPriority.HIGH] : {
      maxRetries        : 3,
      baseDelay         : 300,
      maxDelay          : 3000,
      backoffMultiplier : 2,
      timeoutMs         : 30000
    },
    [RequestPriority.NORMAL] : {
      maxRetries        : 2,
      baseDelay         : 500,
      maxDelay          : 2000,
      backoffMultiplier : 2,
      timeoutMs         : 30000
    },
    [RequestPriority.LOW] : {
      maxRetries        : 1,
      baseDelay         : 1000,
      maxDelay          : 1000,
      backoffMultiplier : 1,
      timeoutMs         : 30000
    }
  }

  constructor() {
    this.axiosInstance = axios.create({
      headers : {
        'Content-Type' : 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (__DEV__) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        if (__DEV__) {
          console.log(`API Response: ${response.status} ${response.config.url}`)
        }
        return response
      },
      (error) => {
        if (__DEV__) {
          console.log(`API Error: ${error.response?.status || 'Network'} ${error.config?.url}`)
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Generate a unique key for request deduplication
   */
  private getRequestKey(method: string, url: string, data?: any): string {
    const dataString = data ? JSON.stringify(data) : ''
    return `${method.toUpperCase()}:${url}:${dataString}`
  }

  /**
   * Get domain from URL for circuit breaker
   */
  private getDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return 'unknown'
    }
  }

  /**
   * Check if circuit breaker is open for a domain
   */
  private isCircuitOpen(domain: string): boolean {
    const circuit = this.circuitBreakers.get(domain)
    if (!circuit) return false

    const now = Date.now()
    
    // Reset circuit if enough time has passed
    if (circuit.isOpen && now > circuit.nextAttemptTime) {
      circuit.isOpen = false
      circuit.failures = 0
      return false
    }

    return circuit.isOpen
  }

  /**
   * Record a failure for circuit breaker
   */
  private recordFailure(domain: string) {
    const now = Date.now()
    let circuit = this.circuitBreakers.get(domain)
    
    if (!circuit) {
      circuit = {
        failures        : 0,
        lastFailureTime : now,
        isOpen          : false,
        nextAttemptTime : now
      }
      this.circuitBreakers.set(domain, circuit)
    }

    circuit.failures++
    circuit.lastFailureTime = now

    // Open circuit after 3 failures in 30 seconds
    if (circuit.failures >= 3) {
      circuit.isOpen = true
      circuit.nextAttemptTime = now + (30000) // 30 second timeout
      console.warn(`Circuit breaker opened for ${domain}`)
    }
  }

  /**
   * Record a success for circuit breaker
   */
  private recordSuccess(domain: string) {
    const circuit = this.circuitBreakers.get(domain)
    if (circuit) {
      circuit.failures = Math.max(0, circuit.failures - 1)
      if (circuit.failures === 0) {
        circuit.isOpen = false
        console.log(`Circuit breaker reset for ${domain}`)
      }
    }
  }

  /**
   * Check if we should use cached response
   */
  private getCachedResponse(key: string, maxAge: number): any | null {
    const cached = this.requestCache.get(key)
    if (cached && Date.now() - cached.timestamp < maxAge) {
      console.log(`Using cached response for ${key}`)
      return cached.data
    }
    return null
  }

  /**
   * Cache a successful response
   */
  private cacheResponse(key: string, data: any) {
    this.requestCache.set(key, {
      data,
      timestamp : Date.now()
    })
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: RetryConfig,
    attempt = 0
  ): Promise<T> {
    try {
      const response = await requestFn()
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      
      // Don't retry on 4xx errors (except 429)
      if (axiosError.response?.status && 
          axiosError.response.status >= 400 && 
          axiosError.response.status < 500 && 
          axiosError.response.status !== 429) {
        throw error
      }

      // Don't retry if we've reached max attempts
      if (attempt >= config.maxRetries) {
        throw error
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      )

      console.log(`Retrying request in ${delay}ms (attempt ${attempt + 1}/${config.maxRetries})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return this.executeWithRetry(requestFn, config, attempt + 1)
    }
  }

  /**
   * Main request execution method
   */
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    url: string,
    data?: any,
    requestConfig?: AxiosRequestConfig,
    priority: RequestPriority = RequestPriority.NORMAL,
    cacheMaxAge?: number
  ): Promise<T> {
    const domain = this.getDomain(url)
    const config = this.retryConfigs[priority]
    const requestKey = this.getRequestKey(method, url, data)

    // Check circuit breaker
    if (this.isCircuitOpen(domain)) {
      throw new Error(`Circuit breaker is open for ${domain}`)
    }

    // Check cache for GET requests
    if (method === 'GET' && cacheMaxAge) {
      const cached = this.getCachedResponse(requestKey, cacheMaxAge)
      if (cached) return cached
    }

    // Check for duplicate request
    const existingRequest = this.pendingRequests.get(requestKey)
    if (existingRequest && method === 'GET') {
      console.log(`Deduplicating request: ${requestKey}`)
      return existingRequest.promise
    }

    // Cancel any obsolete requests for the same endpoint (for GET requests)
    if (method === 'GET') {
      for (const [ key, pending ] of this.pendingRequests.entries()) {
        if (key.includes(url) && Date.now() - pending.timestamp > 5000) {
          pending.abortController.abort()
          this.pendingRequests.delete(key)
        }
      }
    }

    // Create abort controller for this request
    const abortController = new AbortController()

    // Create the request function
    const requestFn = () => this.axiosInstance.request<T>({
      method,
      url,
      data,
      timeout : config.timeoutMs,
      signal  : abortController.signal,
      ...requestConfig
    })

    // Execute request with retry logic
    const promise = this.executeWithRetry(requestFn, config)
      .then((result) => {
        // Record success for circuit breaker
        this.recordSuccess(domain)
        
        // Cache successful GET responses
        if (method === 'GET' && cacheMaxAge) {
          this.cacheResponse(requestKey, result)
        }
        
        return result
      })
      .catch((error) => {
        // Record failure for circuit breaker
        this.recordFailure(domain)
        throw error
      })
      .finally(() => {
        // Clean up pending request
        this.pendingRequests.delete(requestKey)
      })

    // Track pending request
    this.pendingRequests.set(requestKey, {
      promise,
      timestamp : Date.now(),
      abortController
    })

    return promise
  }

  // Convenience methods
  async get<T = any>(
    url: string, 
    config?: AxiosRequestConfig, 
    priority: RequestPriority = RequestPriority.NORMAL,
    cacheMaxAge?: number
  ): Promise<T> {
    return this.request<T>('GET', url, undefined, config, priority, cacheMaxAge)
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig, 
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.request<T>('POST', url, data, config, priority)
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig, 
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.request<T>('PUT', url, data, config, priority)
  }

  async delete<T = any>(
    url: string, 
    config?: AxiosRequestConfig, 
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config, priority)
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig, 
    priority: RequestPriority = RequestPriority.NORMAL
  ): Promise<T> {
    return this.request<T>('PATCH', url, data, config, priority)
  }

  /**
   * Get circuit breaker status for monitoring
   */
  getCircuitStatus() {
    const status: Record<string, any> = {}
    for (const [ domain, circuit ] of this.circuitBreakers.entries()) {
      status[domain] = {
        isOpen          : circuit.isOpen,
        failures        : circuit.failures,
        nextAttemptTime : circuit.nextAttemptTime
      }
    }
    return status
  }

  /**
   * Reset circuit breaker for a domain
   */
  resetCircuit(domain: string) {
    this.circuitBreakers.delete(domain)
    console.log(`Circuit breaker reset for ${domain}`)
  }

  /**
   * Clear all caches and pending requests
   */
  clearAll() {
    this.requestCache.clear()
    this.pendingRequests.clear()
    this.circuitBreakers.clear()
  }
}

// Create singleton instance
export const resilientClient = new ResilientHttpClient()

// Priority-based client interfaces
export const priorityClient = {
  critical : {
    get : <T = any>(url: string, config?: AxiosRequestConfig, cacheMaxAge?: number) => 
      resilientClient.get<T>(url, config, RequestPriority.CRITICAL, cacheMaxAge),
    post : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.post<T>(url, data, config, RequestPriority.CRITICAL),
    put : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.put<T>(url, data, config, RequestPriority.CRITICAL),
    delete : <T = any>(url: string, config?: AxiosRequestConfig) => 
      resilientClient.delete<T>(url, config, RequestPriority.CRITICAL),
  },
  
  high : {
    get : <T = any>(url: string, config?: AxiosRequestConfig, cacheMaxAge?: number) => 
      resilientClient.get<T>(url, config, RequestPriority.HIGH, cacheMaxAge),
    post : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.post<T>(url, data, config, RequestPriority.HIGH),
    put : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.put<T>(url, data, config, RequestPriority.HIGH),
    delete : <T = any>(url: string, config?: AxiosRequestConfig) => 
      resilientClient.delete<T>(url, config, RequestPriority.HIGH),
  },
  
  normal : {
    get : <T = any>(url: string, config?: AxiosRequestConfig, cacheMaxAge?: number) => 
      resilientClient.get<T>(url, config, RequestPriority.NORMAL, cacheMaxAge),
    post : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.post<T>(url, data, config, RequestPriority.NORMAL),
    put : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.put<T>(url, data, config, RequestPriority.NORMAL),
    delete : <T = any>(url: string, config?: AxiosRequestConfig) => 
      resilientClient.delete<T>(url, config, RequestPriority.NORMAL),
  },
  
  low : {
    get : <T = any>(url: string, config?: AxiosRequestConfig, cacheMaxAge?: number) => 
      resilientClient.get<T>(url, config, RequestPriority.LOW, cacheMaxAge),
    post : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.post<T>(url, data, config, RequestPriority.LOW),
    put : <T = any>(url: string, data?: any, config?: AxiosRequestConfig) => 
      resilientClient.put<T>(url, data, config, RequestPriority.LOW),
    delete : <T = any>(url: string, config?: AxiosRequestConfig) => 
      resilientClient.delete<T>(url, config, RequestPriority.LOW),
  }
}

// Utility functions
export const resilientUtils = {
  getCircuitStatus : () => resilientClient.getCircuitStatus(),
  resetCircuit     : (domain: string) => resilientClient.resetCircuit(domain),
  clearAll         : () => resilientClient.clearAll()
}

export default resilientClient 