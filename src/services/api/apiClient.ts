import axios from 'axios'

/**
 * API endpoints for all service calls
 */
export const API_ENDPOINTS = {
    USERS                : '/api/users',
    TRANSACTIONS         : '/api/transactions',
    LOGIN                : '/api/auth/login',
    REGISTER             : '/api/auth/register',
    LOGOUT               : '/api/auth/logout',
    FEE_ESTIMATION       : '/api/fee-estimation',
    MEMPOOL              : '/api/mempool',
    WALLETS              : '/api/wallets',
    WALLET_BALANCE       : '/api/wallet/balance',
    USER_PROFILE         : '/api/user/profile',
    BITCOIN_TRANSACTIONS : '/api/bitcoin/transactions',
    BITCOIN_UTXOS        : '/api/bitcoin/utxos',
    BITCOIN_FEES         : '/api/bitcoin/fees',
    PRICE_CURRENT        : '/api/price/current',
    PRICE_HISTORICAL     : '/api/price/historical',
}

/**
 * Typed API client with standardized error handling
 */
export const apiClient = {
    get : async <T = any>(url: string): Promise<T> => {
        try {
            const response = await axios.get<T>(url)
            return response.data
        } catch (error) {
            console.error(`GET request to ${url} failed:`, error)
            throw error
        }
    },
    
    post : async <T = any>(url: string, data: any): Promise<T> => {
        try {
            const response = await axios.post<T>(url, data)
            return response.data
        } catch (error) {
            console.error(`POST request to ${url} failed:`, error)
            throw error
        }
    },
    
    put : async <T = any>(url: string, data: any): Promise<T> => {
        try {
            const response = await axios.put<T>(url, data)
            return response.data
        } catch (error) {
            console.error(`PUT request to ${url} failed:`, error)
            throw error
        }
    },
    
    delete : async <T = any>(url: string): Promise<T> => {
        try {
            const response = await axios.delete<T>(url)
            return response.data
        } catch (error) {
            console.error(`DELETE request to ${url} failed:`, error)
            throw error
        }
    }
} 