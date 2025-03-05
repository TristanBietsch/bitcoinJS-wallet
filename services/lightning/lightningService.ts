import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/apiEndpoints';

export const lightningService = {
    createLightningInvoice: async () => {
        return await apiClient.post(API_ENDPOINTS.LIGHTNING_INVOICES, {});
    },
    // Add other lightning-related methods as needed
}; 