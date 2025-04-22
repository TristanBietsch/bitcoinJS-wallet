import { useState } from 'react'

export interface SettingsState {
  pinEnabled: boolean
  analyticsOptOut: boolean
}

export default function useSettingsState() {
  const [ pinEnabled, setPinEnabled ] = useState(true)
  const [ analyticsOptOut, setAnalyticsOptOut ] = useState(false)

  return {
    pinEnabled,
    setPinEnabled,
    analyticsOptOut,
    setAnalyticsOptOut
  }
} 