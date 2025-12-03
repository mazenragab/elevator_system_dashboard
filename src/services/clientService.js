import apiClient from './apiClient';

export const clientService = {
  // Manager Routes - إدارة العملاء
  getAllClients: (params) => apiClient.get('/clients', { params }),
  getClientById: (id) => apiClient.get(`/clients/${id}`),
  getClientStats: (id) => apiClient.get(`/clients/${id}/stats`),
  addClient: (data) => apiClient.post('/clients', data),
  updateClient: (id, data) => apiClient.patch(`/clients/${id}`, data),
  deleteClient: (id) => apiClient.delete(`/clients/${id}`),
  
  // Client Contracts - عقود العميل
  getClientContracts: (id, params) => apiClient.get(`/clients/${id}/contracts`, { params }),
  
  // Client Requests - طلبات العميل
  getClientRequests: (id, params) => apiClient.get(`/clients/${id}/requests`, { params }),
  
  // Client Profile Routes - بروفايل العميل
  getMyProfile: () => apiClient.get('/clients/profile/me'),
  updateMyProfile: (data) => apiClient.patch('/clients/profile/me', data),
  getMyContracts: () => apiClient.get('/clients/my/contracts'),
  getMyRequests: () => apiClient.get('/clients/my/requests'),
};