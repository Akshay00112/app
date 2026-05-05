import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from '../config';

// Create axios instance with optimized configuration
const api = axios.create({
    baseURL: Config.API_BASE_URL,
    timeout: Config.REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Retry logic for failed requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Start with 1 second

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async (config, retryCount = 0) => {
    try {
        return await api.request(config);
    } catch (error) {
        // Retry on network errors or 5xx errors
        if (retryCount < MAX_RETRIES && 
            (error.code === 'ECONNABORTED' || 
             error.code === 'ENOTFOUND' ||
             error.response?.status >= 500)) {
            
            const waitTime = RETRY_DELAY * Math.pow(2, retryCount);
            await delay(waitTime);
            return retryRequest(config, retryCount + 1);
        }
        throw error;
    }
};

// Request interceptor: Attach JWT token and implement retry logic
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('Failed to retrieve token:', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and connection errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Clear token on 401 (unauthorized)
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            return Promise.reject({
                ...error,
                message: 'Session expired. Please login again.'
            });
        }
        
        // Network error - attempt retry
        if (!error.response) {
            console.warn('Network error detected, consider retrying');
        }
        
        return Promise.reject(error);
    }
);

export default api;
