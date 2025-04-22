import React from 'react'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'

const AboutScreen = () => {
  const { handleClose } = useMenuNavigation()

  return (
    <SimpleScreenLayout 
      title="About"
      onBackPress={handleClose}
    />
  )
}

export default AboutScreen 