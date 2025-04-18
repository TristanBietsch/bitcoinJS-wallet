import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Menu as MenuIcon } from 'lucide-react-native'
import { Colors } from '@/src/constants/colors'

interface AppHeaderProps {
  title?: string
  showMenuIcon?: boolean
  onMenuPress?: () => void
  rightComponent?: React.ReactNode
  titleStyle?: object
  containerStyle?: object
}

/**
 * A reusable app header component with optional menu icon
 */
const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showMenuIcon = false,
  onMenuPress,
  rightComponent,
  titleStyle,
  containerStyle
}) => {
  return (
    <View style={[ styles.header, containerStyle ]}>
      {/* Title */}
      {title && (
        <ThemedText type="title" style={[ styles.headerTitle, titleStyle ]}>
          {title}
        </ThemedText>
      )}
      
      {/* Right section - Menu icon or custom component */}
      <View style={styles.rightSection}>
        {rightComponent || (
          showMenuIcon && (
            <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
              <MenuIcon size={24} color={Colors.light.text} />
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header : {
    width             : '100%',
    flexDirection     : 'row',
    justifyContent    : 'space-between',
    alignItems        : 'center',
    paddingTop        : 60,
    paddingBottom     : 16,
    paddingHorizontal : 20,
    backgroundColor   : Colors.light.background,
  },
  headerTitle : {
    fontSize   : 22,
    fontWeight : 'bold',
  },
  rightSection : {
    position : 'absolute',
    right    : 20,
    top      : 60,
  },
  menuButton : {
    padding : 8,
  }
})

export default AppHeader 