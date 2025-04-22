import React from 'react'
import { View, StyleSheet } from 'react-native'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'
import SecuritySection from '@/src/components/features/Settings/SecuritySection'
import PrivacySection from '@/src/components/features/Settings/PrivacySection'
import useSettingsState from '@/src/hooks/settings/useSettingsState'

const SettingsScreen = () => {
  const { handleClose } = useMenuNavigation()
  const { 
    pinEnabled, 
    setPinEnabled, 
    analyticsOptOut, 
    setAnalyticsOptOut 
  } = useSettingsState()

  return (
    <SimpleScreenLayout 
      title=""
      onBackPress={handleClose}
    >
      <View style={styles.container}>
        <SecuritySection 
          pinEnabled={pinEnabled}
          setPinEnabled={setPinEnabled}
        />
        
        <PrivacySection
          analyticsOptOut={analyticsOptOut}
          setAnalyticsOptOut={setAnalyticsOptOut}
        />
      </View>
    </SimpleScreenLayout>
  )
}

const styles = StyleSheet.create({
  container : {
    flex      : 1,
    width     : '100%',
    alignSelf : 'flex-start',
  }
})

export default SettingsScreen 