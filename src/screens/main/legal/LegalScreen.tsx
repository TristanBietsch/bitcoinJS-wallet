import React from 'react'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'

const LegalScreen = () => {
  const { handleClose } = useMenuNavigation()

  return (
    <SimpleScreenLayout 
      title="Legal"
      onBackPress={handleClose}
    />
  )
}

export default LegalScreen 