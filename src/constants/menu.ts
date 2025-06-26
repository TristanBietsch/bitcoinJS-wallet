import { MenuItemData } from '@/src/components/features/Menu/MenuItemList'

/**
 * Main menu items for the app
 */
export const MENU_ITEMS: MenuItemData[] = [
  {
    label  : 'Settings',
    route  : '/settings',
    testID : 'menu-item-settings'
  },
  {
    label  : 'Support',
    route  : '/support',
    testID : 'menu-item-support'
  },
  {
    label  : 'About',
    route  : '/about',
    testID : 'menu-item-about'
  }
] 