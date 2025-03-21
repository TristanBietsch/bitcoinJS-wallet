import { useState } from 'react'

const useWalletCreation = () => {
    const [ isCreating, setIsCreating ] = useState(false)

    const createWallet = async () => {
        setIsCreating(true)
        // Logic to create a wallet
        setIsCreating(false)
    }

    return { isCreating, createWallet }
}

export default useWalletCreation 