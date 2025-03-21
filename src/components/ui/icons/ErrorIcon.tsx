import React from 'react'
import { View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

interface ErrorIconProps {
  size?: number;
  color?: string;
}

const ErrorIcon = ({ size = 24, color = '#FFFFFF' }: ErrorIconProps) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
        <Path 
          d="M12 7V13" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        <Circle cx="12" cy="17" r="1" fill={color} />
      </Svg>
    </View>
  )
}

export default ErrorIcon 