import { useState, useEffect } from 'react'

const useFeeEstimation = () => {
    const [ fee, _setFee ] = useState(0)

    useEffect(() => {
        // Estimate transaction fee
    }, [])

    return { fee }
}

export default useFeeEstimation 