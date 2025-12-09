import apiClient from './apiClient';

export const maintenanceService = {
  getAllRequests: (params) => {
    const cleanParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get('/maintenance', { params: cleanParams });
  },

  // جلب كل الفنيين بدون pagination
  getAllTechnicians: (params = {}) => {
    return apiClient.get('/technicians', {
      params: {
        ...params,
        limit: 500,   // نجيب كلهم مرة واحدة
        page: 1
      }
    });
  },

  getRequestById: (id) => apiClient.get(`/maintenance/${id}`),
  getRequestReport: (id) => apiClient.get(`/maintenance/${id}/report`),
  createRequest: (data) => {
    const cleanData = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== '' && data[key] !== null) {
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
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });
    return apiClient.get('/maintenance/technician/my-requests', { params: cleanParams });
  },

  createReport: (id, data) => apiClient.post(`/maintenance/${id}/report`, data),
};