import { useState, useEffect } from 'react'

const useThemeColor = () => {
    const [ themeColor, _setThemeColor ] = useState('#ffffff')

    useEffect(() => {
        // Logic to determine theme color
    }, [])

    return { themeColor }
}

export default useThemeColor 