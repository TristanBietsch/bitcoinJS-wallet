import { useState, useEffect } from 'react';

const useInvoice = () => {
    const [invoice, setInvoice] = useState(null);

    useEffect(() => {
        // Fetch invoice data
    }, []);

    return { invoice };
};

export default useInvoice; 