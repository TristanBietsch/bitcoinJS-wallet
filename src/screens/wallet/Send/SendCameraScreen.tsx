import React from 'react'
import { StyleSheet, View, TouchableOpacity } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { ThemedText } from '@/src/components/common/ThemedText'
import { ChevronLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SendCameraScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const handleBackPress = () => {
    router.back()
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown : false
        }} 
      />

      {/* Camera will be implemented later */}
      <View style={styles.cameraPlaceholder}>
        <ThemedText>Camera functionality will be implemented later</ThemedText>
      </View>

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
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    flex            : 1,
    backgroundColor : '#000'
  },
  cameraPlaceholder : {
    flex            : 1,
    justifyContent  : 'center',
    alignItems      : 'center',
    backgroundColor : '#333'
  },
  backButton : {
    position        : 'absolute',
    left            : 20,
    zIndex          : 10,
    width           : 40,
    height          : 40,
    borderRadius    : 20,
    justifyContent  : 'center',
    alignItems      : 'center',
    backgroundColor : 'rgba(0, 0, 0, 0.3)'
  }
}) 