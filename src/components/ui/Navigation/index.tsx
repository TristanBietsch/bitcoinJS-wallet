import React from 'react'
import { usePathname, useRouter } from 'expo-router'
import { CreditCard, Home, Bitcoin, Clock } from 'lucide-react-native'
import { Pressable, StyleSheet, View, Text } from 'react-native'

// Define valid route paths
type ValidRoutes = '/' | '/waitlist' | '/price' | '/activity'

// Define tabs configuration
const TABS = [
  {
    path  : '/waitlist' as ValidRoutes,
    title : 'Card',
    icon  : CreditCard,
  },
  {
    path  : '/' as ValidRoutes,
    title : 'Home',
    icon  : Home,
  },
  {
    path  : '/price' as ValidRoutes,
    title : 'Price',
    icon  : Bitcoin,
  },
  {
    path  : '/activity' as ValidRoutes,
    title : 'Activity',
    icon  : Clock,
  },
]

export function BottomNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  const handleNavigation = (path: string) => {
    // Type assertion to tell TypeScript this is a valid route
    router.push(path as any)
  }

  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container : {
    position : 'absolute',
    bottom   : 20,
    left     : 20,
    right    : 20,
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