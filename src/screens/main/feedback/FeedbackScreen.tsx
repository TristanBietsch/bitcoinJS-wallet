import React from 'react'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'

const FeedbackScreen = () => {
  const { handleClose } = useMenuNavigation()

  return (
    <SimpleScreenLayout 
      title="Feedback"
      onBackPress={handleClose}
    />
  )
}

export default FeedbackScreen 