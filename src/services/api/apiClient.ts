import { resilientClient } from './resilientClient'

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
 * Typed API client with resilient error handling, retries, and circuit breaking
 * Now uses the resilient client for better reliability
 */
export const apiClient = {
    get : async <T = any>(url: string): Promise<T> => {
        return resilientClient.get<T>(url)
    },
    
    post : async <T = any>(url: string, data: any): Promise<T> => {
        return resilientClient.post<T>(url, data)
    },
    
    put : async <T = any>(url: string, data: any): Promise<T> => {
        return resilientClient.put<T>(url, data)
    },
    
    delete : async <T = any>(url: string): Promise<T> => {
        return resilientClient.delete<T>(url)
    }
} 