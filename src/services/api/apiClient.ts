import axios from 'axios';

export const apiClient = {
    get: async (url: string) => {
        try {
            return await axios.get(url);
        } catch (error) {
            console.error(`GET request to ${url} failed:`, error);
            throw error; // Rethrow the error for further handling
        }
    },
    post: async (url: string, data: any) => {
        try {
            return await axios.post(url, data);
        } catch (error) {
            console.error(`POST request to ${url} failed:`, error);
            throw error; // Rethrow the error for further handling
        }
    },
    // Add other HTTP methods as needed
}; 