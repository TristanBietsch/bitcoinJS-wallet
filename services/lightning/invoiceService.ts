import { apiClient } from '../api/apiClient';
import { API_ENDPOINTS } from '../api/apiEndpoints';

export const invoiceService = {
    getInvoice: async () => {
        return await apiClient.get(API_ENDPOINTS.INVOICES);
    },
}; 