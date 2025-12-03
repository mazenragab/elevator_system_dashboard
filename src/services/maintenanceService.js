import apiClient from './apiClient';

export const maintenanceService = {
  getAllRequests: (params) => {
    // تنظيف البارامترات
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get('/maintenance', { params: cleanParams });
  },
  
  getRequestById: (id) => apiClient.get(`/maintenance/${id}`),
  
  getRequestReport: (id) => apiClient.get(`/maintenance/${id}/report`),
  
  createRequest: (data) => {
    // تنظيف البيانات
    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== '') {
        cleanData[key] = data[key];
      }
    });
    return apiClient.post('/maintenance', cleanData);
  },
  
  updateRequest: (id, data) => apiClient.put(`/maintenance/${id}`, data),
  
  deleteRequest: (id) => apiClient.delete(`/maintenance/${id}`),
  
  assignTechnician: (id, technicianId) => 
    apiClient.patch(`/maintenance/${id}/assign`, { technicianId }),
  
  updateRequestStatus: (id, statusData) => 
    apiClient.patch(`/maintenance/${id}/status`, statusData),
  
  getTechnicianRequests: (params) => {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get('/maintenance/technician/my-requests', { params: cleanParams });
  },
  
  createReport: (id, data) => apiClient.post(`/maintenance/${id}/report`, data),
};