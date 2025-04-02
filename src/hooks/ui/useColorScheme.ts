import { useState, useEffect } from 'react'
import { useColorScheme as useNativeColorScheme } from 'react-native'

// Define the ColorScheme type to match the keys in the Colors object
export type ColorScheme = 'light' | 'dark'

const useColorScheme = (): ColorScheme => {
    const nativeColorScheme = useNativeColorScheme()
    const [ colorScheme, setColorScheme ] = useState<ColorScheme>(nativeColorScheme as ColorScheme || 'light')

    useEffect(() => {
        if (nativeColorScheme) {
            setColorScheme(nativeColorScheme as ColorScheme)
        }
    }, [ nativeColorScheme ])

    return colorScheme
}

export default useColorScheme 