import { useState, useEffect } from 'react';

const useWalletBalance = () => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        // Fetch wallet balance
    }, []);

    return { balance };
};

export default useWalletBalance; 