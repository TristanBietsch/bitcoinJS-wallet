import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/apiEndpoints';

export const channelService = {
    openChannel: async () => {
        return await apiClient.post(API_ENDPOINTS.CHANNELS, {});
    },
}; 