import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Stack } from 'expo-router'
import { AddressCamera } from '@/src/components/features/Send/Address/AddressCamera'
import { useCameraScanner } from '@/src/hooks/send/useCameraScanner'

export default function SendCameraScreen() {
  const {
    handleQRCodeScanned,
    handleCameraError,
    handleClose
  } = useCameraScanner()

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />
      
      <AddressCamera 
        onScanSuccess={handleQRCodeScanned}
        onClose={handleClose}
        onError={handleCameraError}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#000'
  }
}) 