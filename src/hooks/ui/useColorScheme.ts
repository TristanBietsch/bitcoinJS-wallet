import { useState, useEffect } from 'react'
import { useColorScheme as useNativeColorScheme } from 'react-native'

const useColorScheme = () => {
    const nativeColorScheme = useNativeColorScheme()
    const [ colorScheme, setColorScheme ] = useState(nativeColorScheme || 'light')

    useEffect(() => {
        if (nativeColorScheme) {
            setColorScheme(nativeColorScheme)
        }
    }, [ nativeColorScheme ])

    return colorScheme
}

export default useColorScheme 