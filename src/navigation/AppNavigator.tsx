import "@/global.css"
import { AppProvider } from "@/src/components/ui/Provider"
import { StatusBar } from 'expo-status-bar'
import { StyleSheet } from 'react-native'
import 'react-native-reanimated'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomNavigation } from '@/src/components/ui/BottomNavigation'

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AppProvider>
        <BottomNavigation />
        <StatusBar style="auto" />
      </AppProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container : {
    flex : 1,
  },
})
