import { useState, useEffect } from 'react'

const useWallet = () => {
    const [ wallet, _setWallet ] = useState(null)

    useEffect(() => {
        // Fetch wallet data
    }, [])

    return { wallet }
}

export default useWallet 