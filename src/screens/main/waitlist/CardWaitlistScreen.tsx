import React from 'react'
import { StyleSheet } from 'react-native'
import { ThemedView } from '@/src/components/ui/View'
import { FeatureChips } from '@/src/components/features/Card/FeatureChips'
import { useWaitlist } from '@/src/hooks/useWaitlist/useWaitlist'

// Import our modularized components
import CardImage from '@/src/components/features/Card/CardImage'
import SectionHeader from '@/src/components/ui/Header/SectionHeader'
import KeyboardAvoidingScrollView from '@/src/components/layout/KeyboardAvoidingScrollView'
import WaitlistForm from '@/src/components/features/Waitlist/WaitlistForm'

const CardWaitlistScreen = () => {
  const waitlist = useWaitlist()
  const {
    email,
    setEmail,
    isLoading,
    isRegistered,
    registeredEmail,
    submitToWaitlist,
  } = waitlist
  
  // Handle form submission
  const handleSubmit = async () => {
    await submitToWaitlist()
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Image - now using our CardImage component */}
        <CardImage />

        {/* Header Section - now using our SectionHeader component */}
        <SectionHeader
          title={isRegistered ? "You're on the list!" : "Join the Waitlist"}
          subtitle={isRegistered
            ? `We'll notify ${registeredEmail} when your card is ready.`
            : "Get early access to the Nummus Bitcoin Card."}
        />

        {/* Feature Chips */}
        <FeatureChips features={[
          'Zero fees',
          'Instant transfers',
          'Secure storage',
          'Global access'
        ]} />

        {/* Email Form and Submit Button - now using our WaitlistForm component */}
        <WaitlistForm
          email={email}
          setEmail={setEmail}
          isLoading={isLoading}
          isRegistered={isRegistered}
          registeredEmail={registeredEmail}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container : {
    marginTop : 70,
    flex      : 1,
  },
  scrollContent : {
    flexGrow          : 1,
    paddingHorizontal : 20,
    paddingBottom     : 40,
    alignItems        : 'center',
  },
})

export default CardWaitlistScreen 

