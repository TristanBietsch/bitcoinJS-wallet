import React from 'react'
import SendErrorScreen from '@/src/screens/wallet/Send/SendErrorScreen'
import { useSendStore } from '@/src/store/sendStore'

export default function ErrorPage() {
  // Reset error mode when entering error page directly
  const { setErrorMode } = useSendStore()
  
  // Ensure error mode is reset when directly navigating here
  React.useEffect(() => {
    setErrorMode('none')
  }, [ setErrorMode ])
  
  return <SendErrorScreen />
} 