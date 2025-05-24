import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAutoWalletSync } from '@/src/hooks/wallet/useAutoWalletSync'

interface AutoSyncIndicatorProps {
  onSyncStatusChange?: (status: any) => void
}

/**
 * Component that shows auto-sync status and provides manual sync button
 */
export const AutoSyncIndicator: React.FC<AutoSyncIndicatorProps> = ({ 
  onSyncStatusChange 
}) => {
  const { manualSync, getSyncStatus } = useAutoWalletSync()
  
  const syncStatus = getSyncStatus()
  
  // Notify parent of status changes
  React.useEffect(() => {
    onSyncStatusChange?.(syncStatus)
  }, [ syncStatus, onSyncStatusChange ])

  const handleManualSync = async () => {
    try {
      const success = await manualSync()
      console.log('Manual sync result:', success)
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  const getStatusText = () => {
    if (syncStatus.isSuspended) {
      return 'Auto-sync suspended due to errors'
    }
    
    if (!syncStatus.isAutoSyncActive) {
      return 'Auto-sync not active'
    }
    
    if (syncStatus.secondsUntilNextRetry > 0) {
      return `Retrying in ${syncStatus.secondsUntilNextRetry}s`
    }
    
    return 'Auto-sync active (30s interval)'
  }

  const getStatusColor = () => {
    if (syncStatus.isSuspended) return '#ff4444'
    if (!syncStatus.isAutoSyncActive) return '#ffa500'
    return '#00aa00'
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[ styles.statusDot, { backgroundColor: getStatusColor() } ]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      {syncStatus.consecutiveFailures > 0 && (
        <Text style={styles.failureText}>
          Failures: {syncStatus.consecutiveFailures}/{syncStatus.maxFailures}
        </Text>
      )}
      
      <TouchableOpacity 
        style={[
          styles.syncButton, 
          !syncStatus.canManualSync && styles.syncButtonDisabled
        ]} 
        onPress={handleManualSync}
        disabled={!syncStatus.canManualSync}
      >
        <Text style={styles.syncButtonText}>
          {syncStatus.canManualSync ? 'Sync Now' : 'Please Wait...'}
        </Text>
      </TouchableOpacity>
      
      {syncStatus.lastSyncTime > 0 && (
        <Text style={styles.lastSyncText}>
          Last sync: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    padding         : 12,
    backgroundColor : '#f5f5f5',
    borderRadius    : 8,
    margin          : 8,
  },
  statusRow : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 8,
  },
  statusDot : {
    width        : 8,
    height       : 8,
    borderRadius : 4,
    marginRight  : 8,
  },
  statusText : {
    fontSize : 14,
    color    : '#333',
  },
  failureText : {
    fontSize     : 12,
    color        : '#ff4444',
    marginBottom : 8,
  },
  syncButton : {
    backgroundColor   : '#007AFF',
    paddingVertical   : 8,
    paddingHorizontal : 16,
    borderRadius      : 6,
    alignItems        : 'center',
    marginBottom      : 8,
  },
  syncButtonDisabled : {
    backgroundColor : '#ccc',
  },
  syncButtonText : {
    color      : 'white',
    fontSize   : 14,
    fontWeight : '600',
  },
  lastSyncText : {
    fontSize  : 12,
    color     : '#666',
    textAlign : 'center',
  },
}) 