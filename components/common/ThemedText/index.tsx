import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { fonts } from '@/constants/fonts';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
};

export function ThemedText(props: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const { style, type = 'default', ...otherProps } = props;
  
  const styles = {
    default: { 
      fontSize: 16, 
      fontFamily: fonts.regular, 
      color: Colors[colorScheme ?? 'light'].text 
    },
    defaultSemiBold: { 
      fontSize: 16, 
      fontFamily: fonts.semibold, 
      color: Colors[colorScheme ?? 'light'].text 
    },
    title: { 
      fontSize: 24, 
      fontFamily: fonts.bold, 
      color: Colors[colorScheme ?? 'light'].text 
    },
    subtitle: { 
      fontSize: 18, 
      fontFamily: fonts.medium, 
      color: Colors[colorScheme ?? 'light'].text 
    },
    link: { 
      fontSize: 16, 
      fontFamily: fonts.regular, 
      color: Colors[colorScheme ?? 'light'].tint 
    },
  };
  
  return <Text style={[styles[type], style]} {...otherProps} />;
} 