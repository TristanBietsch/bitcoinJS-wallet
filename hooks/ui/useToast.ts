import { useState } from 'react';

const useToast = () => {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        // Logic to display toast
    };

    return { toast, showToast };
};

export default useToast; 