import { apiClient } from '../api/apiClient'
import { API_ENDPOINTS } from '../api/apiEndpoints'

export const mempoolService = {
    getMempoolTransactions : async () => {
        return await apiClient.get(API_ENDPOINTS.MEMPOOL)
    },
} 