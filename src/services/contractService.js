// src/services/contractService.js
import apiClient from './apiClient';

export const contractService = {
  // Routes العامة للعقود
  getAllContracts: (params) => apiClient.get('/contracts', { params }),
  getContractById: (id) => apiClient.get(`/contracts/${id}`),
  
  // Manager Routes - إدارة العقود
  getManagerContracts: (params) => apiClient.get('/manager/contracts', { params }),
  getManagerContractById: (id) => apiClient.get(`/manager/contracts/${id}`),
  createContract: (data) => apiClient.post('/manager/contracts', data),
  updateContract: (id, data) => apiClient.patch(`/manager/contracts/${id}`, data),
  deleteContract: (id) => apiClient.delete(`/manager/contracts/${id}`),
  
  // Client Routes - عقود العميل
  getMyContracts: () => apiClient.get('/clients/my/contracts'),
  getMyContractById: (id) => apiClient.get(`/clients/my/contracts/${id}`),
  
  // عمليات خاصة بالعقود
  getContractElevators: (contractId) => apiClient.get(`/contracts/${contractId}/elevators`),
  addElevatorToContract: (contractId, elevatorId) => 
    apiClient.post(`/contracts/${contractId}/elevators`, { elevatorId }),
  removeElevatorFromContract: (contractId, elevatorId) => 
    apiClient.delete(`/contracts/${contractId}/elevators/${elevatorId }`),
  
  // إدارة مستندات العقد
  getContractDocuments: (contractId) => apiClient.get(`/contracts/${contractId}/documents`),
  uploadContractDocument: (contractId, formData) => 
    apiClient.post(`/contracts/${contractId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteContractDocument: (contractId, documentId) => 
    apiClient.delete(`/contracts/${contractId}/documents/${documentId}`),
  
  // إحصائيات العقود
  getContractStats: (contractId) => apiClient.get(`/contracts/${contractId}/stats`),
  getContractsOverview: () => apiClient.get('/contracts/overview'),
  
  // تصدير العقود
  exportContracts: (params) => 
    apiClient.get('/contracts/export', { 
      params,
      responseType: 'blob' // مهم لتحميل الملفات
    }),
  
  // تجديد العقود
  renewContract: (contractId, data) => 
    apiClient.post(`/contracts/${contractId}/renew`, data),
  
  // تعليق/تفعيل العقود
  suspendContract: (contractId) => apiClient.post(`/contracts/${contractId}/suspend`),
  activateContract: (contractId) => apiClient.post(`/contracts/${contractId}/activate`),
  
  // البحث المتقدم
  searchContracts: (filters) => apiClient.post('/contracts/search', filters),
  
  // إشعارات انتهاء العقود
  getExpiringContracts: (days = 30) => 
    apiClient.get('/contracts/expiring', { params: { days } }),
  
  // تحليل العقود
  getContractAnalytics: (period) => 
    apiClient.get('/contracts/analytics', { params: { period } }),
};