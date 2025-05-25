import React, { ReactNode } from 'react'
import { TouchableOpacity, View, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface WalletOptionButtonProps {
  type: 'primary' | 'secondary'
  icon: ReactNode
  title: string
  description: string
  onPress: () => void
  style?: ViewStyle
  titleStyle?: TextStyle
  descriptionStyle?: TextStyle
}

/**
 * A reusable wallet option button with consistent styling
 */
const WalletOptionButton: React.FC<WalletOptionButtonProps> = ({
  type,
  icon,
  title,
  description,
  onPress,
  style,
  titleStyle,
  descriptionStyle
}) => {
  const isPrimary = type === 'primary'
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        style
      ]}
      onPress={onPress}
    >
      <View style={styles.buttonContentRow}>
        {/* Custom styling for icon based on button type */}
        <View style={styles.iconContainer}>
          {icon}
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText 
            style={[
              styles.title,
              isPrimary ? styles.primaryTitle : styles.secondaryTitle,
              titleStyle
            ]}
          >
            {title}
          </ThemedText>
          
          <ThemedText
            style={[
              styles.description,
              isPrimary ? styles.primaryDescription : styles.secondaryDescription,
              descriptionStyle
            ]}
          >
            {description}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button : {
    borderRadius : 12,
    padding      : 20,
    width        : '100%',
  },
  primaryButton : {
    backgroundColor : Colors.light.buttons.primary,
  },
  secondaryButton : {
    backgroundColor : 'transparent',
    borderWidth     : 1,
    borderColor     : Colors.light.buttons.primary,
  },
  buttonContentRow : {
    flexDirection : 'row',
    alignItems    : 'center',
  },
  iconContainer : {
    marginRight : 16,
  },
  textContainer : {
    flex : 1,
  },
  title : {
    fontSize   : 18,
    fontWeight : 'bold',
  },
  primaryTitle : {
    color : Colors.light.buttons.text,
  },
  secondaryTitle : {
    color : Colors.light.buttons.primary,
  },
  description : {
    fontSize : 14,
    opacity  : 0.8,
  },
  primaryDescription : {
    color : Colors.light.buttons.text,
  },
  secondaryDescription : {
    color : Colors.light.buttons.primary,
  },
})

export default WalletOptionButton 