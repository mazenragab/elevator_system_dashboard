import apiClient from './apiClient';

export const maintenanceService = {
  getAllRequests: (params) => apiClient.get('/maintenance', { params }),
  
  getRequestById: (id) => apiClient.get(`/maintenance/${id}`),
  
  getRequestReport: (id) => apiClient.get(`/maintenance/${id}/report`),
  
  createRequest: (data) => apiClient.post('/maintenance', data),
  
  updateRequest: (id, data) => apiClient.put(`/maintenance/${id}`, data),
  
  deleteRequest: (id) => apiClient.delete(`/maintenance/${id}`),
  
  assignTechnician: (id, technicianId) => 
    apiClient.patch(`/maintenance/${id}/assign`, { technicianId }),
  
  updateRequestStatus: (id, status) => 
    apiClient.patch(`/maintenance/${id}/status`, { status }),
  
  getTechnicianRequests: (params) => apiClient.get('/maintenance/technician/my-requests', { params }),
  
  createReport: (id, data) => apiClient.post(`/maintenance/${id}/report`, data),
  
};