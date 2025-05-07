import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import OnboardingContainer from '@/src/components/ui/OnboardingScreen/OnboardingContainer'
import OnboardingButton from '@/src/components/ui/Button/OnboardingButton'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import StatusIcon from './StatusIcon'
import ConfettiAnimation from '@/src/components/ui/Animations/ConfettiAnimation'
import { StatusType } from '@/src/types/status.types'
import { Colors } from '@/src/constants/colors'

interface StatusScreenProps {
  type: StatusType
  title: string
  subtitle?: string
  showAnimation?: boolean
  primaryButtonLabel?: string
  secondaryButtonLabel?: string
  onPrimaryAction?: () => void
  onSecondaryAction?: () => void
  onBack?: () => void
  useLeftArrow?: boolean
}

/**
 * A reusable component for displaying status screens (success, error, etc.)
 */
const StatusScreen: React.FC<StatusScreenProps> = ({
  type,
  title,
  subtitle,
  showAnimation = type === 'success',
  primaryButtonLabel,
  secondaryButtonLabel,
  onPrimaryAction,
  onSecondaryAction,
  onBack,
  useLeftArrow = false
}) => {
  return (
    <OnboardingContainer>
      {/* Show back button if onBack is provided */}
      {onBack && <BackButton onPress={onBack} />}
      
      {/* Show animation for success by default */}
      {showAnimation && <ConfettiAnimation />}
      
      <View style={styles.content}>
        <ThemedText style={styles.title}>
          {title}
        </ThemedText>
        
        {subtitle && (
          <ThemedText style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        )}
        
        <StatusIcon type={type} />
      </View>
      
      {/* Primary action button */}
      {primaryButtonLabel && onPrimaryAction && (
        <OnboardingButton
          label={primaryButtonLabel}
          onPress={onPrimaryAction}
          style={styles.primaryButton}
          useLeftArrow={useLeftArrow}
        />
      )}
      
      {/* Secondary action button (if provided) */}
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
    flex              : 1,
    alignItems        : 'center',
    justifyContent    : 'center',
    paddingHorizontal : 20
  },
  title : {
    fontSize     : 28,
    fontWeight   : 'bold',
    textAlign    : 'center',
    marginBottom : 10
  },
  subtitle : {
    fontSize     : 16,
    textAlign    : 'center',
    marginBottom : 40
  },
  primaryButton : {
    backgroundColor : Colors.light.buttons.primary,
    marginBottom    : 20,
    width           : '100%'
  },
  secondaryButton : {
    backgroundColor : 'transparent',
    borderWidth     : 1,
    borderColor     : Colors.light.buttons.primary,
    marginBottom    : 50,
    width           : '100%'
  }
})

export default StatusScreen 