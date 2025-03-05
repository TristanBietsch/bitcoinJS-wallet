import { useState, useEffect } from 'react';

const useColorScheme = () => {
    const [colorScheme, setColorScheme] = useState('light');

    useEffect(() => {
        // Logic to determine color scheme
    }, []);

    return { colorScheme };
};

export default useColorScheme; 