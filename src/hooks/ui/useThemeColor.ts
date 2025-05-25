import { useState, useEffect } from 'react'

const useThemeColor = () => {
    const [ themeColor, setThemeColor ] = useState('#ffffff')

    useEffect(() => {
        // Logic to determine theme color
    }, [])

    return { themeColor, setThemeColor }
}

export default useThemeColor 