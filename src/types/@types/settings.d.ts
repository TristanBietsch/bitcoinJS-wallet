declare namespace Settings {
  interface SettingsRowProps {
    icon: React.ReactNode
    title: string
    rightElement?: React.ReactNode
    onPress?: () => void
  }

  interface SettingsSectionProps {
    title: string
    children: React.ReactNode
  }

  interface ToggleProps {
    value: boolean
    onValueChange: (value: boolean) => void
  }
}

export = Settings
export as namespace Settings 