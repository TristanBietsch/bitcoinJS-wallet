import "@/global.css"
import { GluestackUIProvider } from "@/src/components/common/Provider"
import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomNavigation } from '@/src/components/common/BottomNavigation'

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <GluestackUIProvider>
        <BottomNavigation />
        <StatusBar style="auto" />
      </GluestackUIProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },
})
