import React, { useState, useMemo } from 'react'
import { View, StyleSheet, TouchableOpacity, Share as RNShare, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import SafeAreaContainer from '@/src/components/layout/SafeAreaContainer'
import { ThemedText } from '@/src/components/ui/Text'
import { useSendStore } from '@/src/store/sendStore'
import * as Clipboard from 'expo-clipboard'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

/**
 * Screen that displays detailed error information
 */
export default function SendErrorDetailsScreen() {
  const router = useRouter()
  const { errorMode } = useSendStore()
  const [ copyStatus, setCopyStatus ] = useState<'copy' | 'copied'>('copy')
  
  // Generate error details once and keep them stable across re-renders
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
  
  // Create JSON string once and keep it stable
  const errorDataString = useMemo(() => {
    return JSON.stringify(errorInfo.errorData, null, 2)
  }, [ errorInfo ])
  
  // Navigate back to the error screen
  const handleBack = () => {
    router.back()
  }
  
  // Handle bug submission
  const handleSubmitBug = async () => {
    try {
      // Open email client with pre-filled bug report
      await RNShare.share({
        message : `Bug Report - ${errorInfo.code}\n\nError Details:\n${errorDataString}\n\nPlease describe what you were doing when this error occurred:`
      })
    } catch (error) {
      console.error('Error submitting bug:', error)
    }
  }
  
  // Copy error data to clipboard
  const handleCopy = async () => {
    await Clipboard.setStringAsync(errorDataString)
    setCopyStatus('copied')
    
    // Reset the copy status after 2 seconds
    setTimeout(() => {
      setCopyStatus('copy')
    }, 2000)
  }
  
  // Download error data as a file
  const handleDownload = async () => {
    if (Platform.OS === 'web') {
      // For web, create a file download
      const blob = new Blob([ errorDataString ], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-${errorInfo.code}-${Date.now()}.json`
      a.click()
    } else {
      // For mobile, save to file then share
      try {
        const fileUri = `${FileSystem.documentDirectory}error-${errorInfo.code}-${Date.now()}.json`
        await FileSystem.writeAsStringAsync(fileUri, errorDataString)
        
        // On iOS, need to share the file instead of just saving it
        if (Platform.OS === 'ios') {
          await Sharing.shareAsync(fileUri)
        }
      } catch (error) {
        console.error('Error saving file:', error)
      }
    }
  }
  
  // Share error data
  const handleShare = async () => {
    try {
      await RNShare.share({
        message : `Transaction Error (${errorInfo.code}): ${errorDataString}`
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }
  
  return (
    <SafeAreaContainer>
      <View style={styles.container}>
        {/* Back Button Container */}
        <View style={styles.backButtonContainer}>
          <BackButton onPress={handleBack} />
        </View>
        
        {/* Header */}
        <ThemedText style={styles.header}>Error Details</ThemedText>
        
        {/* Help Text */}
        <ThemedText style={styles.helpText}>
          If you need help, share this error with the developer for further help.
        </ThemedText>
        
        {/* Error Information */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Error code</ThemedText>
            <ThemedText style={styles.infoValue}>{errorInfo.code}</ThemedText>
          </View>
        </View>
        
        {/* Error Data JSON */}
        <View style={styles.jsonContainer}>
          <ThemedText style={styles.jsonText}>{errorDataString}</ThemedText>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleDownload}
          >
            <ThemedText style={styles.actionButtonText}>Download</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[ 
              styles.actionButton, 
              copyStatus === 'copied' && styles.actionButtonActive 
            ]} 
            onPress={handleCopy}
          >
            <ThemedText 
              style={[ 
                styles.actionButtonText,
                copyStatus === 'copied' && styles.actionButtonTextActive 
              ]}
            >
              {copyStatus === 'copied' ? 'Copied' : 'Copy'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleShare}
          >
            <ThemedText style={styles.actionButtonText}>Share</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Submit Bug Button */}
        <TouchableOpacity 
          style={styles.submitBugButton} 
          onPress={handleSubmitBug}
        >
          <ThemedText style={styles.submitBugButtonText}>Submit Bug</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaContainer>
  )
}

const styles = StyleSheet.create({
  container : {
    flex       : 1,
    padding    : 16,
    alignItems : 'center'
  },
  backButtonContainer : {
    position : 'absolute',
    top      : 10,
    left     : 10,
    zIndex   : 1
  },
  header : {
    fontSize     : 24,
    fontWeight   : 'bold',
    marginTop    : 48,
    marginBottom : 32
  },
  helpText : {
    fontSize          : 16,
    textAlign         : 'center',
    marginBottom      : 32,
    paddingHorizontal : 20
  },
  infoContainer : {
    width        : '100%',
    marginBottom : 20
  },
  infoRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    marginBottom   : 8,
    width          : '100%'
  },
  infoLabel : {
    fontSize : 16,
    opacity  : 0.7
  },
  infoValue : {
    fontSize   : 16,
    fontWeight : 'bold'
  },
  jsonContainer : {
    width           : '100%',
    padding         : 16,
    backgroundColor : '#F5F5F5',
    borderRadius    : 8,
    marginBottom    : 24
  },
  jsonText : {
    fontFamily : Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize   : 14,
    color      : '#333'
  },
  actionButtonsRow : {
    flexDirection  : 'row',
    justifyContent : 'space-between',
    width          : '100%',
    marginBottom   : 40
  },
  actionButton : {
    paddingVertical   : 10,
    paddingHorizontal : 20,
    borderWidth       : 1,
    borderColor       : '#E0E0E0',
    borderRadius      : 8,
    backgroundColor   : '#FFFFFF',
    flex              : 1,
    marginHorizontal  : 4,
    alignItems        : 'center'
  },
  actionButtonText : {
    fontSize : 16,
    color    : '#333'
  },
  actionButtonActive : {
    backgroundColor : '#4CAF50',
    borderColor     : '#4CAF50'
  },
  actionButtonTextActive : {
    color : '#FFFFFF'
  },
  submitBugButton : {
    width           : '100%',
    padding         : 16,
    backgroundColor : '#2196F3', // Blue color for bug submission
    borderRadius    : 8,
    alignItems      : 'center',
    marginTop       : 'auto',
    marginBottom    : 20
  },
  submitBugButtonText : {
    color      : '#FFFFFF',
    fontSize   : 18,
    fontWeight : 'bold'
  }
})
