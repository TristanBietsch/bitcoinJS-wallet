import React from 'react'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'

const SettingsScreen = () => {
  const { handleClose } = useMenuNavigation()

  return (
    <SimpleScreenLayout 
      title="Settings"
      onBackPress={handleClose}
    />
  )
}

export default SettingsScreen 