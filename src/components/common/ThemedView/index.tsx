import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Colors } from '@/src/constants/Colors';

export function ThemedView(props: ViewProps) {
  const colorScheme = useColorScheme();
  const { style, ...otherProps } = props;
  
  return (
    <View
      style={[
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
        style,
      ]}
      {...otherProps}
    />
  );
} 