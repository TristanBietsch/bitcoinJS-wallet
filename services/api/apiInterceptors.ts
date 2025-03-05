import { apiClient } from './apiClient';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export const setupInterceptors = () => {
    // Setting up request interceptor
    apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
        // Modify request config if needed
        return config;
    });

    // Setting up response interceptor
    apiClient.interceptors.response.use((response: AxiosResponse) => {
        // Handle response if needed
        return response;
    });
}; 