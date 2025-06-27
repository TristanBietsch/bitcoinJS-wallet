import React from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Home, Clock } from 'lucide-react-native'
import { Pressable, StyleSheet, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Define valid route paths
type ValidRoutes = '/' | '/activity'

// Define tabs configuration
const TABS = [
  {
    path  : '/' as ValidRoutes,
    title : 'Home',
    icon  : Home,
  },
  {
    path  : '/activity' as ValidRoutes,
    title : 'Activity',
    icon  : Clock,
  },
]

// Simple container for bottom navigation
// This maintains compatibility with imports from '@/src/components/ui/BottomNavigation'
interface BottomNavigationContainerProps {
  children?: React.ReactNode;
}

export function BottomNavigation({ children }: BottomNavigationContainerProps) {
  return (
    <View style={containerStyles.container}>
      {children}
    </View>
  )
}

// Main navigation component with tabs
export function TabBottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  const handleNavigation = (path: string) => {
    // Type assertion to tell TypeScript this is a valid route
    router.push(path as any)
  }

  return (
    <View style={[
      styles.container,
      {
        // Adjust bottom position based on safe area to ensure consistent positioning
        bottom        : Math.max(insets.bottom, 20),
        paddingBottom : insets.bottom > 0 ? insets.bottom - 15 : 0
      }
    ]}>
      <View style={styles.tabBar}>
        {TABS.map(({ path, title, icon: Icon }) => {
          // Check if current path matches this tab's path
          const isActive = pathname === path
          
          return (
            <Pressable
              key={path}
              style={styles.tabItem}
              onPress={() => handleNavigation(path)}
            >
              <View style={styles.tabContent}>
                <Icon 
                  size={24} 
                  color={isActive ? 'white' : 'rgba(255, 255, 255, 0.5)'} 
                />
                <Text style={[
                  styles.tabLabel,
                  { color: isActive ? 'white' : 'rgba(255, 255, 255, 0.5)' }
                ]}>
                  {title}
                </Text>
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const containerStyles = StyleSheet.create({
  container : {
    flexDirection   : 'row',
    justifyContent  : 'space-around',
    alignItems      : 'center',
    height          : 60,
    backgroundColor : '#fff',
    borderTopWidth  : 1,
    borderTopColor  : '#eee',
  },
})

const styles = StyleSheet.create({
  container : {
    position : 'absolute',
    left     : 20,
    right    : 20,
    // bottom is now dynamic and set in the component
  },
  tabBar : {
    flexDirection   : 'row',
    backgroundColor : 'black',
    borderRadius    : 30,
    height          : 60,
    padding         : 5,
    elevation       : 5,
    shadowColor     : '#000',
    shadowOffset    : { width: 0, height: 2 },
    shadowOpacity   : 0.25,
    shadowRadius    : 3.84,
  },
  tabItem : {
    flex           : 1,
    justifyContent : 'center',
    alignItems     : 'center',
  },
  tabContent : {
    alignItems     : 'center',
    justifyContent : 'center',
  },
  tabLabel : {
    fontSize   : 12,
    fontWeight : '500',
    marginTop  : 2,
  },
}) 