import apiClient from './apiClient';

export const managerService = {
  // Dashboard
  getDashboard: () => apiClient.get('/manager/dashboard'),
  getStats: () => apiClient.get('/manager/stats'),
  getPendingRequests: () => apiClient.get('/manager/pending-requests'),
  
  // Analytics
  getRequestsAnalytics: () => apiClient.get('/manager/analytics/requests'),
  getClientsAnalytics: () => apiClient.get('/manager/analytics/clients'),
  getElevatorsAnalytics: () => apiClient.get('/manager/analytics/elevators'),
  getTechniciansAnalytics: () => apiClient.get('/manager/analytics/technicians'),
  
  // Contracts
  getContracts: (params) => apiClient.get('/manager/contracts', { params }),
  getContract: (id) => apiClient.get(`/manager/contracts/${id}`),
  createContract: (data) => apiClient.post('/manager/contracts', data),
  updateContract: (id, data) => apiClient.put(`/manager/contracts/${id}`, data),
  deleteContract: (id) => apiClient.delete(`/manager/contracts/${id}`),
  
  // Technicians
  getTechnicians: (params) => apiClient.get('/manager/technicians', { params }),
  getTechnician: (id) => apiClient.get(`/manager/technicians/${id}`),
  updateTechnician: (id, data) => apiClient.put(`/manager/technicians/${id}`, data),
  
  // Requests
  getRequests: (params) => apiClient.get('/manager/requests', { params }),
  getRequest: (id) => apiClient.get(`/manager/requests/${id}`),
  createRequest: (data) => apiClient.post('/manager/requests', data),
  assignRequest: (id, technicianId) => 
    apiClient.put(`/manager/requests/${id}/assign`, { technicianId }),
  updateRequestStatus: (id, status) =>
    apiClient.put(`/manager/requests/${id}/status`, { status }),
  
  // Reports
  getReports: (params) => apiClient.get('/manager/reports', { params }),
  generateReport: (data) => apiClient.post('/manager/reports/generate', data),
  
  // Elevators
  getElevators: (params) => apiClient.get('/manager/elevators', { params }),
  getElevator: (id) => apiClient.get(`/manager/elevators/${id}`),
  
  // Clients
  getClients: (params) => apiClient.get('/manager/clients', { params }),
  getClient: (id) => apiClient.get(`/manager/clients/${id}`)
};