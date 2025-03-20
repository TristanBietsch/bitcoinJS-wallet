import { useState, useEffect } from 'react';

const useTransactionHistory = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Fetch transaction history
    }, []);

    return { history };
};

export default useTransactionHistory; 