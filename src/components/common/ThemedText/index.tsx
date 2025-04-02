import React from 'react'
import { Text, TextProps } from 'react-native'
import { fonts } from '@/src/constants/fonts'

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
};

export function ThemedText(props: ThemedTextProps) {
  const { style, type = 'default', ...otherProps } = props
  
  const styles = {
    default : { 
      fontSize   : 16, 
      fontFamily : fonts.regular, 
      color      : '#11181C' 
    },
    defaultSemiBold : { 
      fontSize   : 16, 
      fontFamily : fonts.semibold, 
      color      : '#11181C' 
    },
    title : { 
      fontSize   : 24, 
      fontFamily : fonts.bold, 
      color      : '#11181C' 
    },
    subtitle : { 
      fontSize   : 18, 
      fontFamily : fonts.medium, 
      color      : '#11181C' 
    },
    link : { 
      fontSize   : 16, 
      fontFamily : fonts.regular, 
      color      : '#0a7ea4' 
    },
  }
  
  return <Text style={[ styles[type], style ]} {...otherProps} />
} 