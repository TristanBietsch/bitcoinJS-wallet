import React from 'react'
import { View, StyleSheet } from 'react-native'

interface BottomNavigationProps {
  children?: React.ReactNode;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
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