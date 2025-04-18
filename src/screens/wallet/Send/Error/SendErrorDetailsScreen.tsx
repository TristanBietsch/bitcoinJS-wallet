/**
 * Screen that displays detailed error information
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

// Import modularized components and hooks
import ErrorDetailsLayout from '@/src/components/layout/ErrorDetailsLayout'
import JsonViewer from '@/src/components/ui/DataDisplay/JsonViewer'
import ErrorInfoDisplay from '@/src/components/ui/Feedback/ErrorInfoDisplay'
import ActionButtonsRow from '@/src/components/ui/Button/ActionButtonsRow'
import SubmitBugButton from '@/src/components/ui/Feedback/SubmitBugButton'
import { useErrorDetails } from '@/src/hooks/send/useErrorDetails'
import { useCopyToClipboard } from '@/src/hooks/ui/useCopyToClipboard'
import { downloadOrShareFile, shareContent } from '@/src/utils/file/fileSharing'

/**
 * Screen that displays detailed error information
 */
export default function SendErrorDetailsScreen() {
  // Navigation
  const router = useRouter()
  
  // Get error details from custom hook
  const errorInfo = useErrorDetails()
  
  // Clipboard hook for copy functionality
  const { copyStatus, copyToClipboard } = useCopyToClipboard()
  
  // Navigate back to the error screen
  const handleBack = () => {
    router.back()
  }
  
  // Handle file download
  const handleDownload = async () => {
    await downloadOrShareFile(
      errorInfo.dataString,
      `error-${errorInfo.code}-${Date.now()}`
    )
  }
  
  // Handle copy to clipboard
  const handleCopy = async () => {
    await copyToClipboard(errorInfo.dataString)
  }
  
  // Handle share error data
  const handleShare = async () => {
    await shareContent(
      `Transaction Error (${errorInfo.code}): ${errorInfo.dataString}`
    )
  }
  
  // Define action buttons
  const actionButtons = [
    { label: 'Download', onPress: handleDownload },
    { label: copyStatus === 'copied' ? 'Copied' : 'Copy', onPress: handleCopy, isActive: copyStatus === 'copied' },
    { label: 'Share', onPress: handleShare }
  ]
  
  return (
    <ErrorDetailsLayout onBackPress={handleBack}>
      {/* Error Information */}
      <ErrorInfoDisplay errorCode={errorInfo.code} />
      
      {/* Error Data JSON */}
      <JsonViewer data={errorInfo.dataString} />
      
      {/* Action Buttons */}
      <ActionButtonsRow
        buttons={actionButtons} 
        activeButtonStyle={styles.actionButtonActive}
        activeTextStyle={styles.actionButtonTextActive}
      />
      
      {/* Submit Bug Button */}
      <SubmitBugButton 
        errorCode={errorInfo.code}
        errorData={errorInfo.dataString}
      />
    </ErrorDetailsLayout>
  )
}

const styles = StyleSheet.create({
  actionButtonActive : {
    backgroundColor : '#4CAF50',
    borderColor     : '#4CAF50'
  },
  actionButtonTextActive : {
    color : '#FFFFFF'
  }
})
