/**
 * Enhanced Loading State Component
 * Provides progress tracking, stage indicators, and smooth animations
 */

import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'
import { ThemedText } from '@/src/components/ui/Text'
import { Colors } from '@/src/constants/colors'

interface Stage {
  id: string
  name: string
  description: string
  icon?: string
}

interface EnhancedLoadingStateProps {
  progress: number // 0-100
  currentStage: string
  stages?: Stage[]
  message?: string
  subText?: string
  showProgressBar?: boolean
  showStageIndicator?: boolean
  animationDuration?: number
  style?: any
}

// Default transaction stages
const DEFAULT_STAGES: Stage[] = [
  {
    id: 'initializing',
    name: 'Initializing',
    description: 'Preparing transaction...'
  },
  {
    id: 'validating_inputs',
    name: 'Validating',
    description: 'Checking transaction details...'
  },
  {
    id: 'fetching_utxos',
    name: 'Loading Funds',
    description: 'Fetching available funds...'
  },
  {
    id: 'selecting_utxos',
    name: 'Optimizing',
    description: 'Selecting optimal inputs...'
  },
  {
    id: 'building_transaction',
    name: 'Building',
    description: 'Building transaction...'
  },
  {
    id: 'signing_transaction',
    name: 'Signing',
    description: 'Signing transaction...'
  },
  {
    id: 'broadcasting',
    name: 'Broadcasting',
    description: 'Broadcasting to network...'
  },
  {
    id: 'completed',
    name: 'Complete',
    description: 'Transaction sent successfully!'
  }
]

/**
 * Enhanced loading state with progress tracking and stage indicators
 */
const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({
  progress = 0,
  currentStage = '',
  stages = DEFAULT_STAGES,
  message,
  subText,
  showProgressBar = true,
  showStageIndicator = true,
  animationDuration = 500,
  style
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Find current stage info
  const currentStageInfo = stages.find(stage => stage.id === currentStage) || stages[0]
  const currentStageIndex = stages.findIndex(stage => stage.id === currentStage)

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: animationDuration,
      useNativeDriver: false
    }).start()
  }, [progress, animationDuration])

  // Pulse animation for current stage
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        })
      ])
    )
    
    pulseAnimation.start()
    
    return () => pulseAnimation.stop()
  }, [currentStage])

  // Fade in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }, [])

  const screenWidth = Dimensions.get('window').width
  const progressBarWidth = screenWidth - 80

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      {/* Main Loading Indicator */}
      <Animated.View style={[styles.loadingCircle, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.innerCircle}>
          <ThemedText style={styles.progressText}>
            {Math.round(progress)}%
          </ThemedText>
        </View>
      </Animated.View>

      {/* Current Stage Message */}
      <View style={styles.messageContainer}>
        <ThemedText style={styles.stageTitle}>
          {message || currentStageInfo.name}
        </ThemedText>
        <ThemedText style={styles.stageDescription}>
          {subText || currentStageInfo.description}
        </ThemedText>
      </View>

      {/* Progress Bar */}
      {showProgressBar && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { width: progressBarWidth }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp'
                  })
                }
              ]}
            />
          </View>
        </View>
      )}

      {/* Stage Indicator */}
      {showStageIndicator && (
        <View style={styles.stageIndicatorContainer}>
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex
            const isCurrent = index === currentStageIndex
            const isUpcoming = index > currentStageIndex

            return (
              <View key={stage.id} style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    isCompleted && styles.stageCompleted,
                    isCurrent && styles.stageCurrent,
                    isUpcoming && styles.stageUpcoming
                  ]}
                />
                <ThemedText
                  style={[
                    styles.stageLabel,
                    isCurrent && styles.stageLabelCurrent,
                    isCompleted && styles.stageLabelCompleted
                  ]}
                  numberOfLines={1}
                >
                  {stage.name}
                </ThemedText>
              </View>
            )
          })}
        </View>
      )}

      {/* Background Animation */}
      <View style={styles.backgroundAnimation}>
        {[...Array(3)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.animationRing,
              {
                transform: [{
                  scale: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [1 + i * 0.2, 1.1 + i * 0.2]
                  })
                }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [0.1 - i * 0.03, 0.05 - i * 0.02]
                })
              }
            ]}
          />
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  loadingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.electricBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    shadowColor: Colors.light.electricBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.electricBlue
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center'
  },
  stageDescription: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: 280
  },
  progressBarContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.electricBlue,
    borderRadius: 3
  },
  stageIndicatorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    marginTop: 20
  },
  stageItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
    minWidth: 60
  },
  stageDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4
  },
  stageCompleted: {
    backgroundColor: Colors.light.electricBlue
  },
  stageCurrent: {
    backgroundColor: Colors.light.electricBlue,
    borderWidth: 2,
    borderColor: 'white'
  },
  stageUpcoming: {
    backgroundColor: '#E5E5E5',
    borderWidth: 1,
    borderColor: '#CCCCCC'
  },
  stageLabel: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.6
  },
  stageLabelCurrent: {
    fontWeight: '600',
    opacity: 1,
    color: Colors.light.electricBlue
  },
  stageLabelCompleted: {
    opacity: 0.8
  },
  backgroundAnimation: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -60,
    marginLeft: -60
  },
  animationRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.light.electricBlue
  }
})

export default EnhancedLoadingState 