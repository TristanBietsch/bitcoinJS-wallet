/**
 * Enhanced CLI-style logging utility for React Native Bitcoin wallet
 * Provides clean, symbol-based logs with visual hierarchy and grouping
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Log categories (clean text, no emojis)
export enum LogScope {
  INIT = 'INIT',
  WALLET = 'WALLET',
  API = 'API',
  STATE = 'STATE',
  CRYPTO = 'CRYPTO',
  STORAGE = 'STORAGE',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// CLI-style symbols
export const Symbol = {
  SUCCESS  : '✓',
  ERROR    : '✗',
  WARNING  : '⚠',
  INFO     : '●',
  PROGRESS : '→',
  DATA     : '◆'
} as const

class Logger {
  private isDevelopment: boolean
  private minLevel: LogLevel
  private groupDepth = 0
  private currentSection: string | null = null
  private sectionsPrinted = new Set<string>()

  constructor() {
    this.isDevelopment = __DEV__ || process.env.NODE_ENV !== 'production'
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR
  }

  private shouldLog(level: LogLevel): boolean {
    return this.isDevelopment && level >= this.minLevel
  }

  /**
   * Format message with consistent CLI-style structure
   * Format: CATEGORY  SYMBOL  Message
   */
  private formatMessage(category: string, symbol: string, message: string): string {
    const padding = '  '.repeat(this.groupDepth)
    const categoryPadded = category.padEnd(8)
    return `${padding}${categoryPadded} ${symbol}  ${message}`
  }

  /**
   * Summarize wallet data for clean display
   */
  private summarizeWallet(wallet: any): string {
    if (!wallet) return 'undefined'
    
    const balance = wallet.balances?.confirmed || 0
    const totalAddresses = Object.values(wallet.addresses || {})
      .reduce((total: number, addrs: any) => total + (Array.isArray(addrs) ? addrs.length : 0), 0)
    
    const primaryAddr = wallet.addresses?.nativeSegwit?.[0] || 
                       wallet.addresses?.segwit?.[0] || 
                       wallet.addresses?.legacy?.[0] || 'none'
    
    const shortAddr = primaryAddr.length > 10 ? 
      `${primaryAddr.slice(0, 8)}...${primaryAddr.slice(-4)}` : primaryAddr
    
    return `${balance} sats, ${totalAddresses} addresses (${shortAddr})`
  }

  /**
   * Summarize API call for clean display
   */
  private summarizeApiCall(method: string, url: string, status?: number, data?: any): string {
    // Extract meaningful part of URL
    const pathParts = url.split('/')
    const addressMatch = url.match(/address\/([^\/]+)/)
    const txMatch = url.match(/tx\/([^\/]+)/)
    
    let endpoint = ''
    if (addressMatch) {
      const addr = addressMatch[1]
      const shortAddr = addr.length > 10 ? `${addr.slice(0, 8)}...${addr.slice(-4)}` : addr
      const action = url.includes('/utxo') ? 'UTXOs' : url.includes('/txs') ? 'txs' : 'data'
      endpoint = `${shortAddr}/${action}`
    } else if (txMatch) {
      const txid = txMatch[1]
      const shortTxid = `${txid.slice(0, 8)}...${txid.slice(-4)}`
      endpoint = `tx/${shortTxid}`
    } else {
      endpoint = pathParts.slice(-2).join('/')
    }
    
    let summary = `${method.toUpperCase()} ${endpoint}`
    if (status) {
      summary += ` → ${status}`
      if (Array.isArray(data)) {
        summary += ` (${data.length} items)`
      }
    }
    return summary
  }

  /**
   * Print section divider (smart - only when switching sections)
   */
  divider(section: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    if (this.currentSection !== section && !this.sectionsPrinted.has(section)) {
      const dividerLine = '─'.repeat(15)
      console.log(`${dividerLine} ${section} ${dividerLine}`)
      this.currentSection = section
      this.sectionsPrinted.add(section)
    }
  }

  /**
   * Ensure section is active before logging
   */
  private ensureSection(category: LogScope) {
    const sectionMap: Record<LogScope, string> = {
      [LogScope.CRYPTO]  : 'CRYPTO',
      [LogScope.INIT]    : 'CONFIG', 
      [LogScope.WALLET]  : 'WALLET',
      [LogScope.API]     : 'NETWORK',
      [LogScope.STATE]   : 'RUNTIME',
      [LogScope.STORAGE] : 'STORAGE',
      [LogScope.ERROR]   : 'ERROR',
      [LogScope.DEBUG]   : 'DEBUG'
    }
    
    const section = sectionMap[category]
    if (section) {
      this.divider(section)
    }
  }

  /**
   * Enhanced logging methods with CLI symbols
   */
  
  // Success operations
  success(category: LogScope, message: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    this.ensureSection(category)
    console.log(this.formatMessage(category, Symbol.SUCCESS, message))
  }

  // Error operations
  error(category: LogScope | string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return
    const cat = typeof category === 'string' ? category : category
    if (typeof category !== 'string') {
      this.ensureSection(category)
    }
    console.error(this.formatMessage(cat, Symbol.ERROR, message))
    if (data && this.isDevelopment) {
      console.error(`  └─ ${typeof data === 'object' ? JSON.stringify(data) : data}`)
    }
  }

  // Warning operations
  warn(category: LogScope | string, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return
    const cat = typeof category === 'string' ? category : category
    if (typeof category !== 'string') {
      this.ensureSection(category)
    }
    console.warn(this.formatMessage(cat, Symbol.WARNING, message))
    if (data && this.isDevelopment) {
      console.warn(`  └─ ${typeof data === 'object' ? JSON.stringify(data) : data}`)
    }
  }

  // Info/Loading operations
  info(category: LogScope, message: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    this.ensureSection(category)
    console.log(this.formatMessage(category, Symbol.INFO, message))
  }

  // Progress operations (API calls, etc.)
  progress(category: LogScope, message: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    this.ensureSection(category)
    console.log(this.formatMessage(category, Symbol.PROGRESS, message))
  }

  // Data display
  data(category: LogScope, message: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    this.ensureSection(category)
    console.log(this.formatMessage(category, Symbol.DATA, message))
  }

  // Debug operations
  debug(category: LogScope, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.log(this.formatMessage(category, Symbol.INFO, message))
    if (data && this.isDevelopment) {
      console.log(`  └─ ${typeof data === 'object' ? JSON.stringify(data) : data}`)
    }
  }

  /**
   * Specialized methods for common operations
   */
  
  // Initialization
  init(message: string) {
    this.success(LogScope.INIT, message)
  }

  initProgress(message: string) {
    this.info(LogScope.INIT, message)
  }

  // Wallet operations  
  wallet(message: string, walletData?: any) {
    let logMessage = message
    if (walletData) {
      const summary = this.summarizeWallet(walletData)
      logMessage = `${message}: ${summary}`
    }
    this.data(LogScope.WALLET, logMessage)
  }

  walletSuccess(message: string) {
    this.success(LogScope.WALLET, message)
  }

  walletProgress(message: string) {
    this.info(LogScope.WALLET, message)
  }

  // API operations
  apiRequest(method: string, url: string) {
    const summary = this.summarizeApiCall(method, url)
    this.progress(LogScope.API, summary)
  }

  apiSuccess(method: string, url: string, status: number, data?: any) {
    const summary = this.summarizeApiCall(method, url, status, data)
    this.success(LogScope.API, summary)
  }

  apiError(method: string, url: string, status?: number, error?: any) {
    const summary = this.summarizeApiCall(method, url, status)
    this.error(LogScope.API, summary, error)
  }

  // Crypto operations
  crypto(message: string) {
    this.success(LogScope.CRYPTO, message)
  }

  // Storage operations
  storage(message: string) {
    this.success(LogScope.STORAGE, message)
  }

  // State operations
  state(component: string, change: string) {
    this.debug(LogScope.STATE, `${component}: ${change}`)
  }

  /**
   * Grouping operations
   */
  group(title: string, category: LogScope = LogScope.DEBUG) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.log(this.formatMessage(category, Symbol.DATA, title))
    this.groupDepth++
  }

  groupEnd() {
    if (this.groupDepth > 0) {
      this.groupDepth--
    }
  }

  /**
   * Legacy compatibility methods (will be deprecated)
   */
  
  // Keep some old methods for compatibility during transition
  api(method: string, url: string, status?: number, data?: any) {
    if (status && status >= 200 && status < 300) {
      this.apiSuccess(method, url, status, data)
    } else {
      this.apiError(method, url, status)
    }
  }

  // Timing utilities
  time(label: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.time?.(label)
  }

  timeEnd(label: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.timeEnd?.(label)
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience exports
export default logger 