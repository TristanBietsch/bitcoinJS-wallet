import React from 'react'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ThemedText } from '@/src/components/ThemedText'
import { ChevronLeft, Camera } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SendCameraScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const handleBackPress = () => {
    router.back()
  }

  return (
    <View style={[
      styles.container,
      {
        paddingTop : insets.top
      }
    ]}>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />

      {/* Back Button */}
      <TouchableOpacity 
        style={[
          styles.backButton,
          {
            top : insets.top + 10
          }
        ]} 
        onPress={handleBackPress}
      >
        <ChevronLeft size={24} color="white" />
      </TouchableOpacity>

      {/* Mock Camera View */}
      <View style={styles.cameraContainer}>
        <Camera size={48} color="white" />
        <Text style={styles.cameraText}>Camera Placeholder</Text>
      </View>

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
        <ThemedText style={styles.instructions}>
          Position the QR code within the frame
        </ThemedText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#000'
  },
  backButton : {
    position : 'absolute',
    left     : 10,
    zIndex   : 10
  },
  cameraContainer : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center'
  },
  cameraText : {
    color     : 'white',
    marginTop : 10,
    fontSize  : 16
  },
  overlay : {
    position        : 'absolute',
    top             : 0,
    left            : 0,
    right           : 0,
    bottom          : 0,
    backgroundColor : 'rgba(0, 0, 0, 0.5)',
    justifyContent  : 'center',
    alignItems      : 'center'
  },
  scanArea : {
    width           : 250,
    height          : 250,
    borderWidth     : 2,
    borderColor     : '#fff',
    backgroundColor : 'transparent',
    marginBottom    : 20
  },
  instructions : {
    color     : '#fff',
    fontSize  : 16,
    textAlign : 'center',
    padding   : 20
  }
}) 