import React from 'react';
import { Tabs } from 'expo-router';
import { CreditCard, Home, Bitcoin, Clock } from 'lucide-react-native';

// Define tabs configuration for easier maintenance
const TABS = [
  {
    name: 'waitlist',
    title: 'Card',
    icon: CreditCard,
  },
  {
    name: 'index',
    title: 'Home',
    icon: Home,
  },
  {
    name: 'price',
    title: 'Price',
    icon: Bitcoin,
  },
  {
    name: 'history',
    title: 'History',
    icon: Clock,
  },
];

// Hidden routes that should still be accessible but not visible in tabs
const HIDDEN_ROUTES = ['+not-found'];

export function BottomNavigation() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'black',
          position: 'absolute',
          bottom: 20,
          marginLeft: 20,
          marginRight: 20,
          borderRadius: 30,
          height: 60,
          padding: 5,
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      {/* Render visible tabs */}
      {TABS.map(({ name, title, icon: Icon }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) => <Icon size={24} color={color} />,
          }}
        />
      ))}

      {/* Hide routes that should not appear in the navigation */}
      {HIDDEN_ROUTES.map(name => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{ href: null }}
        />
      ))}
    </Tabs>
  );
} 