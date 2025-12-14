import axios from 'axios';

const api = axios.create({
    // ضفتلك الرابط بتاعك وزودت عليه /api
    baseURL: 'https://back-end-eight-olive.vercel.app/api', 
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['auth-token'] = token;
    }
    return config;
});

export default api;