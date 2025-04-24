import React from 'react'
import { OnboardingWarningScreen } from '@/src/components/ui/OnboardingWarningScreen'
import { WarningItem } from '@/src/components/ui/Toggle/WarningItem'
import { Separator } from '@/src/components/ui/Divider/Separator'
import { useToggleStates } from '@/src/hooks/ui/useToggleStates'

interface SeedPhraseWarningScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function SeedPhraseWarningScreen({ onComplete, onBack }: SeedPhraseWarningScreenProps) {
  const { toggleStates, setToggleState, areAllTogglesOn } = useToggleStates({
    ownershipToggle : false,
    recoveryToggle  : false
  })
  
  return (
    <OnboardingWarningScreen
      title="Your Keys, Your Bitcoin, Your Responsibility"
      onComplete={onComplete}
      onBack={onBack}
      canContinue={areAllTogglesOn}
    >
      <WarningItem
        text="You alone control your bitcoin through your private keys. No one else—including us—can access your funds."
        isToggled={toggleStates.ownershipToggle}
        onToggle={(value) => setToggleState('ownershipToggle', value)}
      />
      
      <Separator />
      
      <WarningItem
        text="If you lose both app access and your backup phrase, your bitcoin is permanently inaccessible to everyone—including you."
        isToggled={toggleStates.recoveryToggle}
        onToggle={(value) => setToggleState('recoveryToggle', value)}
      />
    </OnboardingWarningScreen>
  )
} 