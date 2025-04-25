import React from 'react'
import StatusScreen from '@/src/components/ui/Feedback/StatusScreen'

interface ErrorSeedPhraseProps {
  onTryAgain: () => void
  onBack: () => void
}

/**
 * Screen displayed when seed phrase verification fails
 */
export default function ErrorSeedPhrase({ onTryAgain, onBack }: ErrorSeedPhraseProps) {
  return (
    <StatusScreen
      type="error"
      title="Phrase Doesn't Match"
      subtitle="Double-Check Your Sequence. Enter your Seed Phrase Words in Original Order."
      primaryButtonLabel="Try Again"
      onPrimaryAction={onTryAgain}
      onBack={onBack}
      useLeftArrow={true}
    />
  )
}
