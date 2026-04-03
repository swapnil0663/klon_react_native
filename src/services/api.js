import axios from 'axios';

// Placeholder for now, can be updated later
const BASE_URL = 'https://api.klon-app.com/v1'; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  async (config) => {
    // Logic to add token from storage will go here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling global errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Global error handling logic (e.g., token expiration)
    return Promise.reject(error);
  }
);

export default api;

export const authService = {
  signIn: (email, password) => api.post('/auth/signin', { email, password }),
  signUp: (data) => api.post('/auth/signup', data),
  signOut: () => api.post('/auth/signout'),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
};
