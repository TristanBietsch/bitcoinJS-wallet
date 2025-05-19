/**
 * Key Rotation Utilities (DISABLED)
 * 
 * THIS IS A TEMPORARY FILE WITHOUT ANY ENCRYPTION FUNCTIONALITY
 * IT ONLY SERVES AS A PLACEHOLDER UNTIL PROPER KEY ROTATION IS IMPLEMENTED
 */

/**
 * Schedule key rotation (temporarily disabled)
 * @returns A cleanup function
 */
export function scheduleKeyRotation(): () => void {
  console.warn('⚠️ KEY ROTATION IS DISABLED - NO ENCRYPTION AVAILABLE')
  
  // Since we have no actual encryption, the rotation doesn't do anything
  return () => {
    // Empty cleanup function
    console.log('Key rotation cleanup (no-op)')
  }
}

/**
 * Manually trigger a key rotation (temporarily disabled)
 */
export async function rotateKeys(): Promise<void> {
  console.warn('⚠️ KEY ROTATION IS DISABLED - NO ENCRYPTION AVAILABLE')
  // No-op function
} 