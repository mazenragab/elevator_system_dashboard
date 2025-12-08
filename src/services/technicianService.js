import apiClient from './apiClient';

export const technicianService = {
  // Manager Routes
  getAllTechnicians: (params) => apiClient.get('/technicians', { params }),
  getAvailableTechnicians: () => apiClient.get('/technicians'),
  getTechnicianById: (id) => apiClient.get(`/technicians/${id}`),
  getTechnicianPerformance: (id) => apiClient.get(`/technicians/${id}/performance`),
  addTechnician: (data) => apiClient.post('/technicians', data),
  updateTechnician: (id, data) => apiClient.patch(`/technicians/${id}`, data),
  deleteTechnician: (id) => apiClient.delete(`/technicians/${id}`),

  // Technician Profile Routes
  getMyProfile: () => apiClient.get('/technicians/profile/me'),
  updateMyProfile: (data) => apiClient.patch('/technicians/profile/me', data),
  updateMyLocation: (data) => apiClient.patch('/technicians/location/update', data),
  getMyStats: () => apiClient.get('/technicians/stats/my'),
};