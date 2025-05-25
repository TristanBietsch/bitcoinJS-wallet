/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4'
const tintColorDark = '#fff'

export const Colors = {
  light : {
    text            : '#11181C',
    background      : '#fff',
    tint            : tintColorLight,
    icon            : '#687076',
    tabIconDefault  : '#687076',
    tabIconSelected : tintColorLight,
    pureWhite       : '#FFFFFF',         // Pure White
    offWhite        : '#F9F9F9',          // Off-white
    darkBlueBlack   : '#0A0B10',     // Dark Blue-Black
    electricBlue    : '#0085FF',      // Electric Blue
    cardBackground  : '#1E2434',     // Card Background
    successGreen    : '#34D45C',      // Success Green
    errorRed        : '#FF4A6E',          // Error Red
    inactiveGray    : '#6F7390',      // Inactive Gray
    subtleBorder    : '#3B3E4A',      // Subtle Border
    iconBackground  : '#E6F2FF',      // Light Blue Background for Icons
    successIconBg   : '#E6F8EC',      // Light Green Background for Success Icons
    errorIconBg     : '#FFEAEA',      // Light Red Background for Error Icons
    buttons         : {
      primary   : '#014B8F',      // Primary Blue (changed from red)
      secondary : '#687076',      // Secondary Gray
      success   : '#34D45C',      // Success Green
      warning   : '#F59E0B',      // Warning Orange
      danger    : '#FF4A6E',      // Danger Red
      text      : '#FFFFFF',      // Button Text
    },
    transaction : {
      send : {
        icon       : '#F44336',
        background : '#FFEBEE',
      },
      receive : {
        icon       : '#4CAF50',
        background : '#E8F5E9',
      },
    },
  },
  dark : {
    text            : '#ECEDEE',
    background      : '#151718',
    tint            : tintColorDark,
    icon            : '#9BA1A6',
    tabIconDefault  : '#9BA1A6',
    tabIconSelected : tintColorDark,
    iconBackground  : '#1A3A5A',      // Darker Blue Background for Icons
    successIconBg   : '#1A4D32',      // Dark Green Background for Success Icons
    errorIconBg     : '#FFEAEA',      // Dark Red Background for Error Icons
    buttons         : {
      primary   : '#014B8F',      // Primary Blue (changed from red)
      secondary : '#687076',      // Secondary Gray
      success   : '#34D45C',      // Success Green
      warning   : '#F59E0B',      // Warning Orange
      danger    : '#FF4A6E',      // Danger Red
      text      : '#FFFFFF',      // Button Text
    },
    transaction : {
      send : {
        icon       : '#F44336',
        background : '#FFEBEE',
      },
      receive : {
        icon       : '#4CAF50',
        background : '#E8F5E9',
      },
    },
  },
}

export const colors = Colors
