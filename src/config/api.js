export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile'
  },
  MANAGER: {
    DASHBOARD: '/manager/dashboard',
    CONTRACTS: '/manager/contracts',
    TECHNICIANS: '/manager/technicians',
    REQUESTS: '/manager/requests',
    REPORTS: '/manager/reports',
    ELEVATORS: '/manager/elevators',
    CLIENTS: '/manager/clients'
  }
};