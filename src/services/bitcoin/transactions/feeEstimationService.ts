import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/apiEndpoints';

export const feeEstimationService = {
    estimateFee: async () => {
        return await apiClient.get(API_ENDPOINTS.FEE_ESTIMATION);
    },
}; 