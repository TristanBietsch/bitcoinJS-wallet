import { useState, useCallback } from 'react'
import { SpeedTier } from '@/src/types/transaction/send.types'
import { speedOptions } from '@/src/utils/send/speedOptions'

export const useSpeedOptions = () => {
  const [ speed, setSpeed ] = useState<SpeedTier>('standard')
  const [ showSpeedInfoModal, setShowSpeedInfoModal ] = useState(false)

  const handleSpeedChange = useCallback((newSpeed: SpeedTier) => {
    setSpeed(newSpeed)
  }, [])

  const handleSpeedInfoPress = useCallback(() => {
    setShowSpeedInfoModal(true)
  }, [])

  const handleCloseSpeedInfoModal = useCallback(() => {
    setShowSpeedInfoModal(false)
  }, [])

  const resetSpeed = useCallback(() => {
    setSpeed('standard')
    setShowSpeedInfoModal(false)
  }, [])

  return {
    speed,
    showSpeedInfoModal,
    speedOptions,
    handleSpeedChange,
    handleSpeedInfoPress,
    handleCloseSpeedInfoModal,
    resetSpeed
  }
} 