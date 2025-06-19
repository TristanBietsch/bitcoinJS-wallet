import React from 'react'
import { Key, ChevronRight } from 'lucide-react-native'
import SettingsSection from '@/src/components/ui/SettingsSection'
import SettingsRow from '@/src/components/ui/SettingsRow'
import { handleRecoveryPhrase } from '@/src/utils/settings/settingsUtils'

const SecuritySection: React.FC = () => {
  return (
    <SettingsSection title="Security">
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