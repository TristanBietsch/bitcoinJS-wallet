import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useWalletStore } from '@/src/store/walletStore'

interface SyncIndicatorProps {
  onSyncStatusChange?: (status: any) => void
}

/**
 * Simplified sync indicator that shows wallet sync status
 * Uses manual refresh instead of complex auto-sync
 */
export const AutoSyncIndicator: React.FC<SyncIndicatorProps> = ({ 
  onSyncStatusChange 
}) => {
  const { isSyncing, lastSyncTime, refreshWalletData, error } = useWalletStore()
  
  const handleManualSync = async () => {
    try {
      await refreshWalletData(false) // Non-silent refresh
    } catch (error) {
      console.error('Manual sync failed:', error)
    }
  }

  const getStatusText = () => {
    if (isSyncing) {
      return 'Syncing wallet...'
    }
    
    if (error) {
      return 'Sync error - tap to retry'
    }
    
    if (lastSyncTime > 0) {
      const timeSince = Math.floor((Date.now() - lastSyncTime) / 1000)
      if (timeSince < 60) {
        return `Synced ${timeSince}s ago`
      } else if (timeSince < 3600) {
        return `Synced ${Math.floor(timeSince / 60)}m ago`
      } else {
        return 'Tap to sync wallet'
      }
    }
    
    return 'Tap to sync wallet'
  }

  const getStatusColor = () => {
    if (isSyncing) return '#007AFF'
    if (error) return '#ff4444'
    return '#00aa00'
  }

  // Notify parent of status changes
  React.useEffect(() => {
    onSyncStatusChange?.({
      isSyncing,
      error,
      lastSyncTime,
      canManualSync : !isSyncing
    })
  }, [ isSyncing, error, lastSyncTime, onSyncStatusChange ])

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[ styles.statusDot, { backgroundColor: getStatusColor() } ]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.syncButton, 
          isSyncing && styles.syncButtonDisabled
        ]} 
        onPress={handleManualSync}
        disabled={isSyncing}
      >
        <Text style={styles.syncButtonText}>
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    padding         : 16,
    backgroundColor : '#f5f5f5',
    borderRadius    : 8,
    margin          : 16,
  },
  statusRow : {
    flexDirection : 'row',
    alignItems    : 'center',
    marginBottom  : 12,
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
  syncButton : {
    backgroundColor : '#007AFF',
    padding         : 12,
    borderRadius    : 6,
    alignItems      : 'center',
  },
  syncButtonDisabled : {
    backgroundColor : '#ccc',
  },
  syncButtonText : {
    color      : 'white',
    fontSize   : 14,
    fontWeight : '600',
  },
}) 