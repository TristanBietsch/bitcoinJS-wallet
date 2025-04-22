import React from 'react'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'

const SupportScreen = () => {
  const { handleClose } = useMenuNavigation()

  return (
    <SimpleScreenLayout 
      title="Support"
      onBackPress={handleClose}
    />
  )
}

export default SupportScreen 