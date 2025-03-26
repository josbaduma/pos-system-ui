import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost/api',
    headers: { 'Content-Type': 'application/json' },
});

// Automatically set the token if it's available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Token expirado o no válido. Cerrando sesión...');
            useAuthStore.getState().clearToken();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;
