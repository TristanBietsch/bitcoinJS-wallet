import React from 'react'
import { Switch } from 'react-native'
import { Shield, Key, ChevronRight, RefreshCw } from 'lucide-react-native'
import SettingsSection from '@/src/components/ui/SettingsSection'
import SettingsRow from '@/src/components/ui/SettingsRow'
import { handlePinCodeChange, handleRecoveryPhrase, toggleSetting } from '@/src/utils/settings/settingsUtils'

interface SecuritySectionProps {
  pinEnabled: boolean
  setPinEnabled: (value: boolean) => void
}

const SecuritySection: React.FC<SecuritySectionProps> = ({
  pinEnabled,
  setPinEnabled
}) => {
  return (
    <SettingsSection title="Security">
      {/* PIN Code Toggle */}
      <SettingsRow
        icon={<Shield size={22} color="#000" />}
        title="PIN Code"
        rightElement={
          <Switch
            value={pinEnabled}
            onValueChange={(value) => toggleSetting(setPinEnabled, value)}
            trackColor={{ false: '#D9D9D9', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        }
      />
      
      {/* Change PIN Code */}
      <SettingsRow
        icon={<RefreshCw size={22} color="#000" />}
        title="Change PIN Code"
        rightElement={<ChevronRight size={22} color="#C7C7CC" />}
        onPress={handlePinCodeChange}
      />
      
      {/* Recovery Phrase */}
      <SettingsRow
        icon={<Key size={22} color="#000" />}
        title="Recovery Phrase"
        rightElement={<ChevronRight size={22} color="#C7C7CC" />}
        onPress={handleRecoveryPhrase}
      />
    </SettingsSection>
  )
}

export default SecuritySection 