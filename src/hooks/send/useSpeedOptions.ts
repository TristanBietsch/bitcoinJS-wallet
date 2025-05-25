import { useState, useCallback, useEffect } from 'react'
import { SpeedTier } from '@/src/types/domain/transaction'
import { getSpeedOptions, speedOptions as fallbackSpeedOptions } from '@/src/utils/send/speedOptions'

export const useSpeedOptions = () => {
  const [ speed, setSpeed ] = useState<SpeedTier>('standard')
  const [ showSpeedInfoModal, setShowSpeedInfoModal ] = useState(false)
  const [ speedOptions, setSpeedOptions ] = useState(fallbackSpeedOptions)
  const [ isLoadingFees, setIsLoadingFees ] = useState(true)
  const [ feeLoadError, setFeeLoadError ] = useState<string | null>(null)

  // Load real-time speed options
  const loadSpeedOptions = useCallback(async () => {
    setIsLoadingFees(true)
    setFeeLoadError(null)
    try {
      const realTimeOptions = await getSpeedOptions()
      setSpeedOptions(realTimeOptions)
      console.log('Successfully loaded real-time fee options:', realTimeOptions)
    } catch (error) {
      console.error('Failed to load real-time speed options:', error)
      setFeeLoadError('Failed to load current fee rates')
      // Keep fallback options if loading fails
      setSpeedOptions(fallbackSpeedOptions)
    } finally {
      setIsLoadingFees(false)
    }
  }, [])

  // Load speed options on component mount
  useEffect(() => {
    loadSpeedOptions()
  }, [ loadSpeedOptions ])

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
    isLoadingFees,
    feeLoadError,
    handleSpeedChange,
    handleSpeedInfoPress,
    handleCloseSpeedInfoModal,
    resetSpeed,
    refreshSpeedOptions : loadSpeedOptions
  }
} 