export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        // Remove Content-Type if FormData is used (browser sets multipart/form-data boundary automatically)
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const config = {
            ...options,
            headers
        };

        const res = await fetch(url, config);
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (err) {
        console.error('API Error:', err);
        throw err;
    }
};

export default {
    apiCall,
    API_BASE_URL
};
