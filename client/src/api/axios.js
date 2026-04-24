import axios from 'axios';

// Set the base URL for the API
// When you go live, you change this to your production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Required for cookies/auth
});

// Add a request interceptor for logging/debugging in production
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
