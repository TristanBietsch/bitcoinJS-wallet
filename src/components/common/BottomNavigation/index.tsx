import React from 'react';
import { usePathname, useRouter } from 'expo-router';
import { CreditCard, Home, Bitcoin, Clock } from 'lucide-react-native';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from '@/src/hooks/useColorScheme';

// Define tabs configuration
const TABS = [
  {
    path: '/waitlist',
    title: 'Card',
    icon: CreditCard,
  },
  {
    path: '/',
    title: 'Home',
    icon: Home,
  },
  {
    path: '/price',
    title: 'Price',
    icon: Bitcoin,
  },
  {
    path: '/history',
    title: 'History',
    icon: Clock,
  },
];

// Hidden routes that should still be accessible but not visible in tabs
const HIDDEN_ROUTES = ['+not-found'];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map(({ path, title, icon: Icon }) => {
          const isActive = pathname === path;
          
          return (
            <Pressable
              key={path}
              style={styles.tabItem}
              onPress={() => {
                console.log('Navigating to:', path);
                if (path === '/') router.navigate('/');
                else if (path === '/waitlist') router.navigate('/waitlist');
                else if (path === '/price') router.navigate('/price');
                else if (path === '/history') router.navigate('/history');
              }}
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
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'black',
    borderRadius: 30,
    height: 60,
    padding: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
}); 