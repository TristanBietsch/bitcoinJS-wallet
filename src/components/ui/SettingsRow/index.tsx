import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'

const SettingsRow: React.FC<Settings.SettingsRowProps> = ({
  icon,
  title,
  rightElement,
  onPress
}) => {
  const Container = onPress ? TouchableOpacity : View
  
  return (
    <Container 
      style={styles.row}
      onPress={onPress}
    >
      <View style={styles.rowLeft}>
        {icon}
        <ThemedText style={styles.rowText}>{title}</ThemedText>
      </View>
      {rightElement}
    </Container>
  )
}

const styles = StyleSheet.create({
  row : {
    width             : '100%',
    flexDirection     : 'row',
    alignItems        : 'center',
    justifyContent    : 'space-between',
    paddingVertical   : 18,
    paddingHorizontal : 16,
    borderBottomWidth : 1,
    borderBottomColor : '#EFEFEF'
  },
  rowLeft : {
    flexDirection : 'row',
    alignItems    : 'center'
  },
  rowText : {
    fontSize   : 17,
    fontWeight : '400',
    marginLeft : 16
  }
})

export default SettingsRow 