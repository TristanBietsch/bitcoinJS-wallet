import { useState, useCallback } from 'react'
import { SpeedTier } from '@/src/types/domain/transaction'
import { speedOptions } from '@/src/utils/send/speedOptions'
import { useCustomFee } from './useCustomFee'

export const useSpeedOptions = () => {
  const [ speed, setSpeed ] = useState<SpeedTier>('standard')
  const [ showSpeedInfoModal, setShowSpeedInfoModal ] = useState(false)
  const { customFee : _customFee } = useCustomFee()

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