import React from 'react'
import { Stack } from 'expo-router'
import { AddressCamera } from '@/src/components/features/Send/Address/AddressCamera'
import { useCameraScanner } from '@/src/hooks/send/useCameraScanner'
import FullScreenContainer from '@/src/components/layout/FullScreenContainer'

/**
 * Camera screen for scanning QR codes with Bitcoin addresses
 */
export default function SendCameraScreen() {
  const {
    handleQRCodeScanned,
    handleCameraError,
    handleClose
  } = useCameraScanner()

  return (
    <FullScreenContainer backgroundColor="#000">
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />
      
      <AddressCamera 
        onScanSuccess={handleQRCodeScanned}
        onClose={handleClose}
        onCameraError={handleCameraError}
      />
    </FullScreenContainer>
  )
} 