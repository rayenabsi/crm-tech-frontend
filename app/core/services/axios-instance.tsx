import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8070/api',
  timeout: 20000
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('crm_tech_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized, maybe redirect to login...');
    }
    console.error('API error:', error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
