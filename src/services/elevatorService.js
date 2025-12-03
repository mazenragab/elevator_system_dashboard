import apiClient from './apiClient';

export const elevatorService = {
  // Manager Routes - إدارة المصاعد
  getAllElevators: (params) => apiClient.get('/elevators', { params }),
  getElevatorById: (id) => apiClient.get(`/elevators/${id}`),
  getElevatorStats: (id) => apiClient.get(`/elevators/${id}/stats`),
  addElevator: (data) => apiClient.post('/elevators', data),
  updateElevator: (id, data) => apiClient.put(`/elevators/${id}`, data),
  deleteElevator: (id) => apiClient.delete(`/elevators/${id}`),
  
  // Client Elevators - مصاعد العميل
  getClientElevators: (clientId, params) => apiClient.get(`/elevators/clients/${clientId}/`, { params }),
  
  // Elevator Maintenance - صيانة المصاعد
  getElevatorRequests: (id, params) => apiClient.get(`/elevators/${id}/requests`, { params }),
  getElevatorMaintenanceHistory: (id, params) => apiClient.get(`/elevators/${id}/maintenance-history`, { params }),
  
  // My Elevators (for clients)
  getMyElevators: () => apiClient.get('/elevators/my'),
};