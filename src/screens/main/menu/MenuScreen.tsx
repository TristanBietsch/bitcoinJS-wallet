import React from 'react'
import MenuScreenLayout from '@/src/components/layout/MenuScreenLayout'
import MenuItemList from '@/src/components/features/Menu/MenuItemList'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'
import { MENU_ITEMS } from '@/src/constants/menu'

const MenuScreen = () => {
  const { handleClose, handleNavigation } = useMenuNavigation()

  return (
    <MenuScreenLayout onClose={handleClose}>
      <MenuItemList
        items={MENU_ITEMS}
        onItemPress={handleNavigation}
      />
    </MenuScreenLayout>
  )
}

export default MenuScreen 