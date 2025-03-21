import { useState } from 'react'

const useBiometrics = () => {
    const [ isBiometricEnabled, setIsBiometricEnabled ] = useState(false)

    const enableBiometrics = () => {
        // Logic to enable biometrics
        setIsBiometricEnabled(true)
    }

    const disableBiometrics = () => {
        // Logic to disable biometrics
        setIsBiometricEnabled(false)
    }

    return { isBiometricEnabled, enableBiometrics, disableBiometrics }
}

export default useBiometrics 