import React, { ReactNode } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { Colors } from '@/src/constants/colors'

interface InfoScreenProps {
  title: string
  description?: string
  icon?: ReactNode
  primaryButtonLabel?: string
  secondaryButtonLabel?: string
  onPrimaryAction: () => void
  onSecondaryAction?: () => void
  onBack?: () => void
  children?: ReactNode
  contentStyle?: ViewStyle
  iconContainerStyle?: ViewStyle
}

/**
 * A reusable information screen component for onboarding and education flows
 */
const InfoScreen: React.FC<InfoScreenProps> = ({
  title,
  description,
  icon,
  primaryButtonLabel = 'Continue',
  secondaryButtonLabel,
  onPrimaryAction,
  onSecondaryAction,
  onBack,
  children,
  contentStyle,
  iconContainerStyle
}) => {
  return (
    <OnboardingContainer>
      {onBack && <BackButton onPress={onBack} />}
      
      <View style={[ styles.content, contentStyle ]}>
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
        
        {description && (
          <ThemedText style={styles.subtitle}>
            {description}
          </ThemedText>
        )}
        
        {icon && (
          <View style={[ styles.iconContainer, iconContainerStyle ]}>
            {icon}
          </View>
        )}
        
        {children}
      </View>
      
      <OnboardingButton
        label={primaryButtonLabel}
        onPress={onPrimaryAction}
        style={styles.primaryButton}
      />
      
      {secondaryButtonLabel && onSecondaryAction && (
        <OnboardingButton
          label={secondaryButtonLabel}
          onPress={onSecondaryAction}
          style={styles.secondaryButton}
        />
      )}
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    marginTop         : 140,
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    width             : '100%',
    paddingHorizontal : 24,
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10,
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 40,
  },
  iconContainer : {
    width           : 160,
    height          : 160,
    borderRadius    : 90,
    backgroundColor : Colors.light.iconBackground,
    alignItems      : 'center',
    justifyContent  : 'center',
    marginBottom    : 40,
  },
  primaryButton : {
    backgroundColor  : Colors.light.buttons.primary,
    marginHorizontal : 30,
    marginBottom     : 20,
    width            : '100%',
  },
  secondaryButton : {
    backgroundColor  : 'transparent',
    borderWidth      : 1,
    borderColor      : Colors.light.buttons.primary,
    marginHorizontal : 30,
    marginBottom     : 50,
    width            : '100%',
  }
})

export default InfoScreen 