/**
 * Component showing API health status and issues
 * Shows when APIs are having problems and provides retry functionality
 */
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useApiHealth, useCircuitBreakers } from '@/src/hooks/useResilientStatus'

export const ApiHealthIndicator: React.FC = () => {
  const { isHealthy, status, message, affectedDomain } = useApiHealth()
  const { resetCircuit } = useCircuitBreakers()

  if (isHealthy) {
    return null // Don't show anything when everything is working
  }

  const getStatusColor = () => {
    switch (status) {
      case 'degraded': return '#ff9500' // Orange
      case 'critical': return '#ff3b30' // Red
      default: return '#34c759' // Green
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'degraded': return 'API Issues'
      case 'critical': return 'API Problems'
      default: return 'API Status'
    }
  }

  const handleRetry = () => {
    if (affectedDomain) {
      resetCircuit(affectedDomain)
    }
  }

  return (
    <View style={{
      backgroundColor : getStatusColor(),
      padding         : 12,
      margin          : 8,
      borderRadius    : 8,
      flexDirection   : 'row',
      alignItems      : 'center',
      justifyContent  : 'space-between'
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
          {getStatusText()}
        </Text>
        {message && (
          <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>
            {message}
          </Text>
        )}
      </View>
      
      {affectedDomain && (
        <TouchableOpacity
          onPress={handleRetry}
          style={{
            backgroundColor   : 'rgba(255,255,255,0.2)',
            paddingHorizontal : 12,
            paddingVertical   : 6,
            borderRadius      : 6
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
            Retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

/**
 * Usage example in a wallet screen:
 * 
 * import { ApiHealthIndicator } from '@/src/components/ApiHealthIndicator'
 * 
 * export const WalletScreen = () => {
 *   return (
 *     <View>
 *       <ApiHealthIndicator />
 *       {/* Rest of your wallet UI *\/}
 *     </View>
 *   )
 * }
 */ 