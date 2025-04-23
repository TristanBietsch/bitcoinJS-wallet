import React from 'react'
import { View, StyleSheet } from 'react-native'
import { OnboardingContainer, OnboardingTitle, OnboardingDescription } from '@/src/components/ui/OnboardingScreen'
import { Plus, Download } from 'lucide-react-native'
import { BackButton } from '@/src/components/ui/Navigation/BackButton'
import { WalletOptionButton } from '@/src/components/ui/Button'
import { ButtonsContainer } from '@/src/components/ui/Layout'

interface WalletChoiceScreenProps {
  onCreateWallet: () => void;
  onImportWallet: () => void;
  onBack: () => void;
}

export default function WalletChoiceScreen({ 
  onCreateWallet, 
  onImportWallet,
  onBack 
}: WalletChoiceScreenProps) {
  return (
    <OnboardingContainer>
      <BackButton onPress={onBack} />
      
      <View style={styles.content}>
        <OnboardingTitle>
          Set Up Your Wallet
        </OnboardingTitle>
        
        <OnboardingDescription>
          Choose how you want to start with Nummus
        </OnboardingDescription>

        <ButtonsContainer>
          <WalletOptionButton
            type="primary"
            icon={<Plus />}
            title="Create New Wallet"
            description="Start fresh with a new Bitcoin wallet"
            onPress={onCreateWallet}
          />

          <WalletOptionButton
            type="secondary"
            icon={<Download />}
            title="Import Existing Wallet"
            description="Restore a wallet via seed phrase"
            onPress={onImportWallet}
          />
        </ButtonsContainer>
      </View>
    </OnboardingContainer>
  )
}

const styles = StyleSheet.create({
  content : {
    flex           : 1,
    alignItems     : 'center',
    justifyContent : 'center',
    width          : '100%',
    paddingTop     : 40,
  }
}) 