import React from 'react'
import EmailForm from '@/src/components/ui/Form/EmailForm'
import SuccessBadge from '@/src/components/ui/Feedback/SuccessBadge'

interface WaitlistFormProps {
  email: string
  setEmail: (email: string) => void
  isLoading: boolean
  isRegistered: boolean
  registeredEmail?: string
  onSubmit: () => void
}

/**
 * A component to handle waitlist registration that shows either a form or success state
 */
const WaitlistForm: React.FC<WaitlistFormProps> = ({
  email,
  setEmail,
  isLoading,
  isRegistered,
  onSubmit
}) => {
  if (isRegistered) {
    return (
      <SuccessBadge 
        message="You're on the waitlist!" 
      />
    )
  }
  
  return (
    <EmailForm
      email={email}
      setEmail={setEmail}
      onSubmit={onSubmit}
      isLoading={isLoading}
      buttonText="Join Now"
    />
  )
}

export default WaitlistForm 