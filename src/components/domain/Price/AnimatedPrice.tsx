/**
 * Animated Bitcoin price component
 * Displays current price with animation effects when price changes
 */
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Animated, View } from 'react-native';
import { useRef } from 'react';
import { AnimatedPriceProps } from '@/src/types/price.types';
import { formatCurrency } from '@/src/utils/formatting/price';

const AnimatedPrice: React.FC<AnimatedPriceProps> = ({ price, previousPrice }) => {
  // Animation value for color transition
  const colorFadeAnim = useRef(new Animated.Value(0)).current;
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'none'>('none');
  
  // Run animation when price changes
  useEffect(() => {
    // Skip animation on initial load
    if (previousPrice === null || price === null) return;
    
    // Only animate if price changed
    if (price !== previousPrice) {
      // Determine price direction
      if (price > previousPrice) {
        setPriceDirection('up');
      } else if (price < previousPrice) {
        setPriceDirection('down');
      }
      
      // Reset animation value
      colorFadeAnim.setValue(1);
      
      // Animate color fade back to black
      Animated.timing(colorFadeAnim, {
        toValue: 0,
        duration: 2500, // Longer duration for a slow fade
        useNativeDriver: false, // Color animations need false for native driver
      }).start();
    }
  }, [price, previousPrice, colorFadeAnim]);

  // Interpolate colors for fade animation
  const greenColor = colorFadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(0, 0, 0)', 'rgb(0, 215, 130)'] // Black to green
  });
  
  const redColor = colorFadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(0, 0, 0)', 'rgb(255, 77, 77)'] // Black to red
  });
  
  // Select color based on price direction
  const textColor = priceDirection === 'up' 
    ? greenColor 
    : priceDirection === 'down' 
      ? redColor 
      : 'rgb(0, 0, 0)';
  
  return (
    <View style={styles.priceWrapper}>
      <Animated.Text
        style={[
          styles.price, 
          { color: textColor }
        ]}
      >
        {formatCurrency(price)}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  priceWrapper: {
    height: 70, // Fixed height to prevent layout shifts
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: {
    fontSize: 54, // Larger font size
    fontFamily: 'IBMPlexMono-Bold', // Monospace font for price
    letterSpacing: -1, // Tighter letter spacing
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default AnimatedPrice; 