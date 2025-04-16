import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Image } from 'expo-image'

interface CardImageProps {
  imageSource?: any
  containerStyle?: object
  imageStyle?: object
  transitionDuration?: number
}

/**
 * A component for displaying a card image with proper styling
 */
const CardImage: React.FC<CardImageProps> = ({
  imageSource = require('@/assets/images/nummus-card.png'),
  containerStyle,
  imageStyle,
  transitionDuration = 500
}) => {
  return (
    <View style={[ styles.cardImageContainer, containerStyle ]}>
      <Image
        source={imageSource}
        style={[ styles.cardImage, imageStyle ]}
        contentFit="contain"
        transition={transitionDuration}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  cardImageContainer : {
    width          : '100%',
    height         : 220,
    marginTop      : 40,
    alignItems     : 'center',
    justifyContent : 'center',
  },
  cardImage : {
    width  : '90%',
    height : '100%',
  },
})

export default CardImage 