import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

// Feature chip data
export const FEATURE_CHIPS = [
  { id: 1, text: 'No Annual Fee' },
  { id: 2, text: 'Bitcoin Rewards' },
  { id: 3, text: 'Instant Cashback' },
  { id: 4, text: 'Global Acceptance' },
  { id: 5, text: 'No Foreign Fees' },
  { id: 6, text: 'Secure Transactions' },
  { id: 7, text: 'Mobile Payments' },
  { id: 8, text: 'Virtual Card' },
  { id: 9, text: 'Spending Controls' },
  { id: 10, text: '24/7 Support' },
];

// Feature chip component
const FeatureChip = ({ text }: { text: string }) => {
  return (
    <View style={styles.chip}>
      <Check size={16} color="#FFFFFF" />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
};

// Row of animated feature chips
const AnimatedFeatureRow = ({
  features,
  direction = 'left',
}: {
  features: typeof FEATURE_CHIPS;
  direction?: 'left' | 'right';
}) => {
  const translateX = useSharedValue(0);
  const containerWidth = 1000; // Large enough to contain all chips
  const animationDistance = 500; // Distance to animate

  useEffect(() => {
    // Start the animation when the component mounts
    translateX.value = direction === 'left' ? 0 : -animationDistance;
    
    translateX.value = withRepeat(
      withTiming(
        direction === 'left' ? -animationDistance : 0,
        {
          duration: 20000, // 20 seconds for one complete cycle
          easing: Easing.linear,
        }
      ),
      -1, // Infinite repetitions
      true // Reverse on completion
    );
  }, [direction, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.rowContainer}>
      <Animated.View style={[styles.animatedRow, animatedStyle]}>
        {features.map((feature) => (
          <FeatureChip key={feature.id} text={feature.text} />
        ))}
        {/* Duplicate chips to create seamless loop */}
        {features.map((feature) => (
          <FeatureChip key={`dup-${feature.id}`} text={feature.text} />
        ))}
      </Animated.View>
    </View>
  );
};

// Main feature chips component with two animated rows
export const FeatureChips = () => {
  // Split features into two rows
  const topRowFeatures = FEATURE_CHIPS.slice(0, 5);
  const bottomRowFeatures = FEATURE_CHIPS.slice(5, 10);

  return (
    <View style={styles.container}>
      <AnimatedFeatureRow features={topRowFeatures} direction="left" />
      <AnimatedFeatureRow features={bottomRowFeatures} direction="right" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 20,
    overflow: 'hidden',
  },
  rowContainer: {
    height: 40,
    marginVertical: 5,
    overflow: 'hidden',
  },
  animatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.errorRed,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
}); 