import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // This is your Laravel Herd URL
});

export default api;