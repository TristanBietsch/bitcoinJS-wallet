import React from 'react'
import { Switch } from 'react-native'
import { BarChart4 } from 'lucide-react-native'
import SettingsSection from '@/src/components/ui/SettingsSection'
import SettingsRow from '@/src/components/ui/SettingsRow'
import { toggleSetting } from '@/src/utils/settings/settingsUtils'

interface PrivacySectionProps {
  analyticsOptOut: boolean
  setAnalyticsOptOut: (value: boolean) => void
}

const PrivacySection: React.FC<PrivacySectionProps> = ({
  analyticsOptOut,
  setAnalyticsOptOut
}) => {
  return (
    <SettingsSection title="Privacy">
      {/* Analytics Opt Out */}
      <SettingsRow
        icon={<BarChart4 size={22} color="#000" />}
        title="Opt out of analytics"
        rightElement={
          <Switch
            value={analyticsOptOut}
            onValueChange={(value) => toggleSetting(setAnalyticsOptOut, value)}
            trackColor={{ false: '#D9D9D9', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        }
      />
    </SettingsSection>
  )
}

export default PrivacySection 