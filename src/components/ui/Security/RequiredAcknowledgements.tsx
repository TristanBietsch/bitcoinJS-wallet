import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { Separator } from '@/src/components/ui/Divider/Separator'

interface RequiredAcknowledgementsProps {
  children: ReactNode
  style?: ViewStyle
  showSeparators?: boolean
}

/**
 * A container component for security acknowledgements that need to be toggled on
 */
const RequiredAcknowledgements: React.FC<RequiredAcknowledgementsProps> = ({
  children,
  style,
  showSeparators = true
}) => {
  // Convert children to array to handle either single or multiple children
  const childrenArray = React.Children.toArray(children)
  
  return (
    <View style={[ styles.container, style ]}>
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {showSeparators && index < childrenArray.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    width          : '100%',
    marginVertical : 20,
  }
})

export default RequiredAcknowledgements 