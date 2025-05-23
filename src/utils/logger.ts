/**
 * Clean, structured logging utility for React Native Bitcoin wallet
 * Provides scoped, emoji-enhanced logs with data summarization
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Log scopes with emojis
export enum LogScope {
  INIT = '🚀',
  WALLET = '💰', 
  API = '🌐',
  STATE = '🧠',
  CRYPTO = '🔐',
  STORAGE = '💾',
  ERROR = '❌',
  DEBUG = '🔧'
}

// Status indicators
export const Status = {
  SUCCESS : '✅',
  WARNING : '⚠️',
  LOADING : '🔄',
  DATA    : '📦',
  ACTION  : '🎯'
} as const

class Logger {
  private isDevelopment: boolean
  private minLevel: LogLevel

  constructor() {
    this.isDevelopment = __DEV__ || process.env.NODE_ENV !== 'production'
    this.minLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR
  }

  private shouldLog(level: LogLevel): boolean {
    return this.isDevelopment && level >= this.minLevel
  }

  private formatMessage(scope: LogScope, status: string, message: string): string {
    const scopeText = Object.keys(LogScope)[Object.values(LogScope).indexOf(scope)]
    return `${scopeText} ${scope} ${status} ${message}`
  }

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

  private summarizeApiCall(method: string, url: string, status?: number, data?: any): string {
    const endpoint = url.split('/api/')[1] || url.split('.info/')[1] || url
    const shortEndpoint = endpoint.length > 30 ? `${endpoint.slice(0, 30)}...` : endpoint
    
    let summary = `${method.toUpperCase()} ${shortEndpoint}`
    if (status) {
      summary += ` → ${status}`
      if (Array.isArray(data)) {
        summary += ` (${data.length} items)`
      } else if (data && typeof data === 'object') {
        const keys = Object.keys(data)
        if (keys.length > 0) {
          summary += ` (${keys.length} fields)`
        }
      }
    }
    return summary
  }

  // Main logging methods
  init(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return
    console.log(this.formatMessage(LogScope.INIT, Status.SUCCESS, message))
    if (data && this.isDevelopment) {
      console.log('  └─', JSON.stringify(data, null, 2))
    }
  }

  initLoading(message: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    console.log(this.formatMessage(LogScope.INIT, Status.LOADING, message))
  }

  wallet(message: string, walletData?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return
    let logMessage = message
    
    if (walletData) {
      const summary = this.summarizeWallet(walletData)
      logMessage += `: ${summary}`
    }
    
    console.log(this.formatMessage(LogScope.WALLET, Status.SUCCESS, logMessage))
  }

  walletSync(message: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    console.log(this.formatMessage(LogScope.WALLET, Status.LOADING, message))
  }

  api(method: string, url: string, status?: number, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return
    const summary = this.summarizeApiCall(method, url, status, data)
    const statusIcon = status && status >= 200 && status < 300 ? Status.SUCCESS : 
                      status && status >= 400 ? Status.WARNING : Status.DATA
    
    console.log(this.formatMessage(LogScope.API, statusIcon, summary))
  }

  apiRequest(method: string, url: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    const summary = this.summarizeApiCall(method, url)
    console.log(this.formatMessage(LogScope.API, Status.LOADING, summary))
  }

  state(component: string, change: string) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.log(this.formatMessage(LogScope.STATE, Status.DATA, `${component}: ${change}`))
  }

  crypto(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.INFO)) return
    console.log(this.formatMessage(LogScope.CRYPTO, Status.SUCCESS, message))
    if (data && this.isDevelopment) {
      console.log('  └─', data)
    }
  }

  storage(message: string) {
    if (!this.shouldLog(LogLevel.INFO)) return
    console.log(this.formatMessage(LogScope.STORAGE, Status.SUCCESS, message))
  }

  warn(message: string, data?: any) {
    if (!this.shouldLog(LogLevel.WARN)) return
    console.warn(this.formatMessage(LogScope.ERROR, Status.WARNING, message))
    if (data) {
      console.warn('  └─', data)
    }
  }

  error(message: string, error?: any) {
    if (!this.shouldLog(LogLevel.ERROR)) return
    console.error(this.formatMessage(LogScope.ERROR, Status.WARNING, message))
    if (error) {
      console.error('  └─', error)
    }
  }

  debug(scope: LogScope, message: string, data?: any) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.log(this.formatMessage(scope, Status.DATA, message))
    if (data && this.isDevelopment) {
      console.log('  └─', data)
    }
  }

  // Grouped operations
  group(title: string, scope: LogScope = LogScope.DEBUG) {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.group?.(this.formatMessage(scope, Status.ACTION, title))
  }

  groupEnd() {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    console.groupEnd?.()
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