import { useState } from 'react'

const usePin = () => {
    const [ pin, setPin ] = useState('')

    const setNewPin = (newPin: string) => {
        // Logic to set a new PIN
        setPin(newPin)
    }

    const clearPin = () => {
        // Logic to clear the PIN
        setPin('')
    }

    return { pin, setNewPin, clearPin }
}

export default usePin 