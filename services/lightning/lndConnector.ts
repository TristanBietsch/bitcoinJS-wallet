import { apiClient } from '../api/apiClient';

export const lndConnector = {
    connect: () => {
        return apiClient.post('/lnd/connect', {});
    },
}; 