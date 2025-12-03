import apiClient from './apiClient';

export const clientService = {
  // Manager Only
  getAllClients: (params) => apiClient.get('/clients', { params }),
  
  getClientById: (id) => apiClient.get(`/clients/${id}`),
  
  getClientStats: (params) => apiClient.get('/clients/stats', { params }),
  
  // Client Only (للمستقبل)
  getMyProfile: () => apiClient.get('/clients/profile/me'),
  
  updateMyProfile: (data) => apiClient.patch('/clients/profile/me', data),
  
  getMyElevators: () => apiClient.get('/clients/elevators/me'),
  
  getMyContracts: () => apiClient.get('/clients/contracts/me'),
  
  getMyStats: () => apiClient.get('/clients/stats/me'),
};