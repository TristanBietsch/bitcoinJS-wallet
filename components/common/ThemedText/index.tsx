import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
};

export function ThemedText(props: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const { style, type = 'default', ...otherProps } = props;
  
  const styles = {
    default: { fontSize: 16, color: Colors[colorScheme ?? 'light'].text },
    defaultSemiBold: { fontSize: 16, fontWeight: '600' as const, color: Colors[colorScheme ?? 'light'].text },
    title: { fontSize: 24, fontWeight: 'bold' as const, color: Colors[colorScheme ?? 'light'].text },
    subtitle: { fontSize: 18, fontWeight: 'bold' as const, color: Colors[colorScheme ?? 'light'].text },
    link: { fontSize: 16, color: Colors[colorScheme ?? 'light'].tint },
  };
  
  return <Text style={[styles[type], style]} {...otherProps} />;
} 