import React, { ReactNode } from 'react'
import { 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  StyleSheet, 
  ViewStyle, 
  KeyboardAvoidingViewProps 
} from 'react-native'

interface KeyboardAvoidingScrollViewProps extends KeyboardAvoidingViewProps {
  children: ReactNode
  contentContainerStyle?: ViewStyle
  scrollViewStyle?: ViewStyle
  showsVerticalScrollIndicator?: boolean
  scrollEnabled?: boolean
}

/**
 * A component that combines KeyboardAvoidingView and ScrollView for better UX with forms
 */
const KeyboardAvoidingScrollView: React.FC<KeyboardAvoidingScrollViewProps> = ({
  children,
  contentContainerStyle,
  scrollViewStyle,
  showsVerticalScrollIndicator = false,
  scrollEnabled = true,
  ...keyboardAvoidingViewProps
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[ styles.keyboardAvoid, keyboardAvoidingViewProps.style ]}
      {...keyboardAvoidingViewProps}
    >
      <ScrollView
        contentContainerStyle={[ styles.scrollContent, contentContainerStyle ]}
        style={scrollViewStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        scrollEnabled={scrollEnabled}
        bounces={scrollEnabled}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  keyboardAvoid : {
    flex : 1,
  },
  scrollContent : {
    flexGrow : 1,
  },
})

export default KeyboardAvoidingScrollView 