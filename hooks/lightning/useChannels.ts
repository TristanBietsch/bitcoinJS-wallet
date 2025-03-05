import { useState, useEffect } from 'react';

const useChannels = () => {
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        // Fetch channels
    }, []);

    return { channels };
};

export default useChannels; 