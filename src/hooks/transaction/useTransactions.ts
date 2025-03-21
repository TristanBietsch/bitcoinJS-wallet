import { useState, useEffect } from 'react'

const useTransactions = () => {
    const [ transactions, _setTransactions ] = useState([])

    useEffect(() => {
        // Fetch transactions
    }, [])

    return { transactions }
}

export default useTransactions 