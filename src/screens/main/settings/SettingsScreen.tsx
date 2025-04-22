import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import SimpleScreenLayout from '@/src/components/layout/SimpleScreenLayout'
import { useMenuNavigation } from '@/src/hooks/menu/useMenuNavigation'
import { ThemedText } from '@/src/components/ui/Text'
import { Shield, Key, BarChart4, ChevronRight, RefreshCw } from 'lucide-react-native'

const SettingsScreen = () => {
  const { handleClose } = useMenuNavigation()
  const [ pinEnabled, setPinEnabled ] = useState(true)
  const [ analyticsOptOut, setAnalyticsOptOut ] = useState(false)

  return (
    <SimpleScreenLayout 
      title=""
      onBackPress={handleClose}
    >
      <View style={styles.container}>
        {/* Security Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Security</ThemedText>
          
          {/* PIN Code Toggle */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Shield size={22} color="#000" style={styles.icon} />
              <ThemedText style={styles.rowText}>PIN Code</ThemedText>
            </View>
            <Switch 
              value={pinEnabled}
              onValueChange={setPinEnabled}
              trackColor={{ false: '#D9D9D9', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          {/* Change PIN Code */}
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <RefreshCw size={22} color="#000" style={styles.icon} />
              <ThemedText style={styles.rowText}>Change PIN Code</ThemedText>
            </View>
            <ChevronRight size={22} color="#C7C7CC" />
          </TouchableOpacity>
          
          {/* Recovery Phrase */}
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Key size={22} color="#000" style={styles.icon} />
              <ThemedText style={styles.rowText}>Recovery Phrase</ThemedText>
            </View>
            <ChevronRight size={22} color="#C7C7CC" />
          </TouchableOpacity>
        </View>
        
        {/* Privacy Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Privacy</ThemedText>
          
          {/* Analytics Opt Out */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <BarChart4 size={22} color="#000" style={styles.icon} />
              <ThemedText style={styles.rowText}>Opt out of analytics</ThemedText>
            </View>
            <Switch 
              value={analyticsOptOut}
              onValueChange={setAnalyticsOptOut}
              trackColor={{ false: '#D9D9D9', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </SimpleScreenLayout>
  )
}

const styles = StyleSheet.create({
  container : {
    flex      : 1,
    width     : '100%',
    alignSelf : 'flex-start', // Override the center alignment from SimpleScreenLayout
  },
  section : {
    width        : '100%',
    marginTop    : 32,
    marginBottom : 24
  },
  sectionTitle : {
    fontSize     : 24,
    fontWeight   : 'bold',
    marginBottom : 20,
    paddingLeft  : 16
  },
  row : {
    width             : '100%',
    flexDirection     : 'row',
    alignItems        : 'center',
    justifyContent    : 'space-between',
    paddingVertical   : 18,
    paddingHorizontal : 16,
    borderBottomWidth : 1,
    borderBottomColor : '#EFEFEF'
  },
  rowLeft : {
    flexDirection : 'row',
    alignItems    : 'center'
  },
  icon : {
    marginRight : 16
  },
  iconPlaceholder : {
    width       : 22,
    height      : 22,
    marginRight : 16
  },
  rowText : {
    fontSize   : 17,
    fontWeight : '400'
  }
})

export default SettingsScreen 