import apiClient from './apiClient';

export const elevatorService = {
  // For All (Manager + Client)
  getAllElevators: (params) => apiClient.get('/elevators', { params }),
  
  getElevatorById: (id) => apiClient.get(`/elevators/${id}`),
  
  getElevatorHistory: (id) => apiClient.get(`/elevators/${id}/history`),
  
  getElevatorRequests: (id) => apiClient.get(`/elevators/${id}/requests`),
  
  // Manager + Client
  createElevator: (data) => apiClient.post('/elevators', data),
  
  updateElevator: (id, data) => apiClient.put(`/elevators/${id}`, data),
  
  // Manager + Technician
  updateElevatorStatus: (id, status) => 
    apiClient.patch(`/elevators/${id}/status`, { status }),
  
  // Manager Only
  deleteElevator: (id) => apiClient.delete(`/elevators/${id}`),
};