import React from 'react'
import { OnboardingWarningScreen } from '@/src/components/ui/OnboardingWarningScreen'
import { WarningItem } from '@/src/components/ui/Toggle/WarningItem'
import RequiredAcknowledgements from '@/src/components/ui/Security/RequiredAcknowledgements'
import { useToggleStates } from '@/src/hooks/ui/useToggleStates'
import { getSeedPhraseWarnings, getSeedPhraseWarningToggleState } from '@/src/utils/security/securityMessaging'
import { SEED_PHRASE_TITLES } from '@/src/constants/securityContent'

interface SeedPhraseWarningScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

/**
 * Screen that displays security warnings before seed phrase generation
 */
export default function SeedPhraseWarningScreen({ onComplete, onBack }: SeedPhraseWarningScreenProps) {
  // Get warnings and initial toggle states
  const warnings = getSeedPhraseWarnings()
  const initialToggleState = getSeedPhraseWarningToggleState()
  
  // Use toggle state hook
  const { toggleStates, setToggleState, areAllTogglesOn } = useToggleStates(initialToggleState)
  
  return (
    <OnboardingWarningScreen
      title={SEED_PHRASE_TITLES.WARNING}
      onComplete={onComplete}
      onBack={onBack}
      canContinue={areAllTogglesOn}
    >
      <RequiredAcknowledgements>
        {warnings.map((warning) => (
          <WarningItem
            key={warning.id}
            text={warning.text}
            isToggled={toggleStates[warning.id]}
            onToggle={(value) => setToggleState(warning.id, value)}
          />
        ))}
      </RequiredAcknowledgements>
    </OnboardingWarningScreen>
  )
} 