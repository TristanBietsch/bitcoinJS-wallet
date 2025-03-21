import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export const Collapsible = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [ expanded, setExpanded ] = useState(false)
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={styles.title}>{title}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.content}>{children}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    marginVertical  : 10,
    backgroundColor : '#f5f5f5',
    borderRadius    : 8,
    padding         : 15,
  },
  title : {
    fontWeight : 'bold',
    fontSize   : 16,
  },
  content : {
    marginTop : 10,
  },
}) 