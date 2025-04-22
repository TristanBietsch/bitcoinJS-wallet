import React from 'react'
import { View, StyleSheet } from 'react-native'
import MenuItem from '@/src/components/ui/Menu/MenuItem'

export interface MenuItemData {
  label: string
  route: string
  testID?: string
}

interface MenuItemListProps {
  items: MenuItemData[]
  onItemPress: (route: string) => void
}

/**
 * Component that renders a list of menu items
 */
const MenuItemList: React.FC<MenuItemListProps> = ({
  items,
  onItemPress
}) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <MenuItem
          key={`menu-item-${index}-${item.label}`}
          label={item.label}
          testID={item.testID}
          onPress={() => onItemPress(item.route)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    position          : 'absolute',
    bottom            : 200,
    left              : 0,
    paddingHorizontal : 20,
    width             : '100%',
  }
})

export default MenuItemList 