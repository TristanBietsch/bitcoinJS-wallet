import React from 'react'
import { View, Text, StyleSheet, Animated, Dimensions, Easing } from 'react-native'
import { Check } from 'lucide-react-native'

interface FeatureChipsProps {
  features: string[];
}

export const FeatureChips: React.FC<FeatureChipsProps> = ({ features }) => {
  // Split features into two rows
  const midPoint = Math.ceil(features.length / 2)
  const firstRow = features.slice(0, midPoint)
  const secondRow = features.slice(midPoint)

  // Get screen width for proper animation
  const screenWidth = Dimensions.get('window').width

  // Animation values for both rows
  const firstRowAnim = React.useRef(new Animated.Value(0)).current
  const secondRowAnim = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    // First row animation (right to left)
    Animated.loop(
      Animated.sequence([
        Animated.timing(firstRowAnim, {
          toValue         : -1,
          duration        : 15000,
          useNativeDriver : true,
          easing          : Easing.linear,
        }),
        Animated.timing(firstRowAnim, {
          toValue         : 0,
          duration        : 0,
          useNativeDriver : true,
        }),
      ])
    ).start()

    // Second row animation (left to right)
    Animated.loop(
      Animated.sequence([
        Animated.timing(secondRowAnim, {
          toValue         : 1,
          duration        : 15000,
          useNativeDriver : true,
          easing          : Easing.linear,
        }),
        Animated.timing(secondRowAnim, {
          toValue         : 0,
          duration        : 0,
          useNativeDriver : true,
        }),
      ])
    ).start()
  }, [ firstRowAnim, secondRowAnim ])

  const renderMarqueeRow = (items: string[], translateX: Animated.Value) => {
    return (
      <Animated.View
        style={[
          styles.marqueeContainer,
          {
            transform : [
              {
                translateX : translateX.interpolate({
                  inputRange  : [ -1, 1 ],
                  outputRange : [ -screenWidth, screenWidth ],
                }),
              },
            ],
          },
        ]}
      >
        {items.map((feature, index) => (
          <View key={index} style={styles.chip}>
            <Check size={16} color="#666" style={styles.checkIcon} />
            <Text style={styles.chipText}>{feature}</Text>
          </View>
        ))}
        {/* Duplicate items for seamless loop */}
        {items.map((feature, index) => (
          <View key={`duplicate-${index}`} style={styles.chip}>
            <Check size={16} color="#666" style={styles.checkIcon} />
            <Text style={styles.chipText}>{feature}</Text>
          </View>
        ))}
      </Animated.View>
    )
  }

  return (
    <View style={styles.container}>
      {renderMarqueeRow(firstRow, firstRowAnim)}
      {renderMarqueeRow(secondRow, secondRowAnim)}
    </View>
  )
}

const styles = StyleSheet.create({
  container : {
    gap      : 8,
    padding  : 16,
    overflow : 'hidden',
  },
  marqueeContainer : {
    flexDirection : 'row',
    gap           : 8,
  },
  chip : {
    backgroundColor   : '#f0f0f0',
    paddingVertical   : 8,
    paddingHorizontal : 16,
    borderRadius      : 20,
    flexDirection     : 'row',
    alignItems        : 'center',
  },
  checkIcon : {
    marginRight : 8,
  },
  chipText : {
    fontSize : 14,
    color    : '#666',
  },
}) 