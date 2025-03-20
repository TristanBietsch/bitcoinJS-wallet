import { useState, useEffect } from 'react';

const useWallet = () => {
    const [wallet, setWallet] = useState(null);

    useEffect(() => {
        // Fetch wallet data
    }, []);

    return { wallet };
};

export default useWallet; 