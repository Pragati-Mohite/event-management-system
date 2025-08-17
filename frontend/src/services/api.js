import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwordData) => api.put('/auth/updatepassword', passwordData),
};

// Events API
export const eventsAPI = {
  getEvents: (params = {}) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (eventData) => api.post('/events', eventData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateEvent: (id, eventData) => api.put(`/events/${id}`, eventData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getMyEvents: (params = {}) => api.get('/events/organizer/me', { params }),
  getCategories: () => api.get('/events/categories'),
};

// Tickets API
export const ticketsAPI = {
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  getMyTickets: (params = {}) => api.get('/tickets/my-tickets', { params }),
  getTicket: (id) => api.get(`/tickets/${id}`),
  cancelTicket: (id) => api.put(`/tickets/${id}/cancel`),
  verifyTicket: (qrCodeData) => api.post('/tickets/verify', { qrCodeData }),
  scanTicket: (qrCodeData) => api.post('/tickets/scan', { qrCodeData }),
  getEventTickets: (eventId, params = {}) => api.get(`/tickets/event/${eventId}`, { params }),
};

// Utility functions
export const uploadFile = async (file, type = 'event') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
