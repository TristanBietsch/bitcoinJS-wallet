import { useMemo } from 'react'
import { useSendStore } from '@/src/store/sendStore'

export type ErrorMode = 'validation' | 'network' | 'unknown'

interface ErrorInfo {
  code: string
  errorData: any
  dataString: string
}

/**
 * Hook to generate error details based on error mode
 */
export const useErrorDetails = (): ErrorInfo => {
  const { errorMode } = useSendStore()
  
  // Generate error details based on error mode
  const errorInfo = useMemo(() => {
    const timestamp = new Date().toISOString()
    const errorId = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    switch (errorMode) {
      case 'validation':
        return {
          code      : 'ErrValidationFailed',
          errorData : {
            "code"    : 400,
            "message" : "Could not validate transaction inputs",
            "data"    : {
              "validation_tries" : 1,
              "failures"         : [
                "Invalid address format", 
                "Amount exceeds limits"
              ]
            }
          }
        }
      
      case 'network':
        return {
          code      : 'ErrNoRouteFound',
          errorData : {
            "code"    : 503,
            "message" : "Could not find a route",
            "data"    : {
              "getroute_tries" : 1,
              "sendpay_tries"  : 0,
              "failures"       : []
            }
          }
        }
        
      default:
        return {
          code      : 'ErrUnknown',
          errorData : {
            "code"    : 500,
            "message" : "Unknown error occurred",
            "data"    : {
              "timestamp" : timestamp,
              "error_id"  : errorId
            }
          }
        }
    }
  }, [ errorMode ])
  
  // Create JSON string from error data
  const dataString = useMemo(() => {
    return JSON.stringify(errorInfo.errorData, null, 2)
  }, [ errorInfo ])
  
  return {
    ...errorInfo,
    dataString
  }
} 