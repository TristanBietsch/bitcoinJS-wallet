import { apiClient } from '../api/apiClient'
import { API_ENDPOINTS } from '../api/apiEndpoints'

export const transactionService = {
    createTransaction : async () => {
        return await apiClient.post(API_ENDPOINTS.TRANSACTIONS, {})
    },
    getTransactionHistory : async () => {
        return await apiClient.get(API_ENDPOINTS.TRANSACTIONS)
    },
    // Add other transaction-related methods as needed
}