import apiClient from './apiClient';

export const reportService = {
  // For All
  getAllReports: (params) => apiClient.get('/reports', { params }),
  
  getReportsStatistics: (params) => apiClient.get('/reports/statistics', { params }),
  
  getReportByRequest: (requestId) => apiClient.get(`/reports/request/${requestId}`),
  
  getReportById: (id) => apiClient.get(`/reports/${id}`),
  
  // Manager + Technician
  createReport: (data) => apiClient.post('/reports', data),
  
  // Technician Only
  getTechnicianReports: (params) => apiClient.get('/reports/technician/my-reports', { params }),
  
  // Manager Only
  updateReport: (id, data) => apiClient.put(`/reports/${id}`, data),
  
  deleteReport: (id) => apiClient.delete(`/reports/${id}`),
};