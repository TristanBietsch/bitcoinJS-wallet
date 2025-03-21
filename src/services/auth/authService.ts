import { apiClient } from '../api/apiClient'
import { API_ENDPOINTS } from '../api/apiEndpoints'

export const authService = {
    login : async (credentials: { username: string; password: string }) => {
        return apiClient.post(API_ENDPOINTS.LOGIN, credentials)
    },
    logout : async () => {
        return apiClient.post(API_ENDPOINTS.LOGOUT, {})
    },
} 