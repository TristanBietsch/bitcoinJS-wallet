import { Platform, Share } from 'react-native'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

/**
 * Downloads or shares file content based on the platform
 * @param content - Content to save to a file
 * @param fileName - Name of the file (without extension)
 * @param mimeType - MIME type of the file
 */
export const downloadOrShareFile = async (
  content: string,
  fileName: string = `file-${Date.now()}`,
  mimeType: string = 'application/json'
): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // For web, create a file download
      const blob = new Blob([ content ], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileName}.${getExtensionFromMimeType(mimeType)}`
      a.click()
      URL.revokeObjectURL(url) // Clean up
    } else {
      // For mobile, save to file then share
      const extension = getExtensionFromMimeType(mimeType)
      const fileUri = `${FileSystem.documentDirectory}${fileName}.${extension}`
      await FileSystem.writeAsStringAsync(fileUri, content)
      
      // On iOS, need to share the file instead of just saving it
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(fileUri)
      }
    }
  } catch (error) {
    console.error('Error saving/sharing file:', error)
    throw error
  }
}

/**
 * Shares text content via the device's share dialog
 * @param content - Content to share
 * @param title - Title/subject of the share
 */
export const shareContent = async (content: string, title?: string): Promise<void> => {
  try {
    const shareOptions: any = { message: content }
    if (title) {
      shareOptions.subject = title
    }
    
    await Share.share(shareOptions)
  } catch (error) {
    console.error('Error sharing content:', error)
    throw error
  }
}

/**
 * Determines file extension from MIME type
 */
const getExtensionFromMimeType = (mimeType: string): string => {
  switch (mimeType) {
    case 'application/json':
      return 'json'
    case 'text/plain':
      return 'txt'
    case 'text/html':
      return 'html'
    case 'text/csv':
      return 'csv'
    default:
      return 'txt'
  }
} 