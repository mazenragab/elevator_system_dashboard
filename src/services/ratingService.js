import apiClient from './apiClient';

export const ratingService = {
  // For All
  getAllRatings: (params) => apiClient.get('/ratings', { params }),
  
  getRatingsStatistics: (params) => apiClient.get('/ratings/statistics', { params }),
  
  getRatingByRequest: (requestId) => apiClient.get(`/ratings/request/${requestId}`),
  
  getTechnicianRatings: (technicianId, params) => 
    apiClient.get(`/ratings/technician/${technicianId}`, { params }),
  
  getRatingById: (id) => apiClient.get(`/ratings/${id}`),
  
  // Client Only
  getMyRatings: (params) => apiClient.get('/ratings/my-ratings', { params }),
  
  createRating: (data) => apiClient.post('/ratings', data),
  
  updateRating: (id, data) => apiClient.put(`/ratings/${id}`, data),
  
  deleteRating: (id) => apiClient.delete(`/ratings/${id}`),
};