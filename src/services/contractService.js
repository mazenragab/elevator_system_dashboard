// src/services/contractService.js
import apiClient from './apiClient';

export const contractService = {
  // Get all contracts (Manager only)
  getAllContracts: (params) => apiClient.get('/contracts', { params }),
  
  // Get single contract
  getContractById: (id) => apiClient.get(`/contracts/${id}`),
  
  // Create new contract (Manager only)
  createContract: (data) => apiClient.post('/contracts', data),
  
  // Update contract (Manager only)
  updateContract: (id, data) => apiClient.patch(`/contracts/${id}`, data),
  
  // Delete contract (Manager only)
  deleteContract: (id) => apiClient.delete(`/contracts/${id}`),
  
  // Get contracts by client
  getContractsByClient: (clientId) => apiClient.get(`/contracts/client/${clientId}`),
  
  // Get contract elevators
  getContractElevators: (contractId) => apiClient.get(`/contracts/${contractId}/elevators`),
  
  // Add elevator to contract
  addElevatorToContract: (contractId, elevatorId) => 
    apiClient.post(`/contracts/${contractId}/elevators`, { elevatorId }),
  
  // Remove elevator from contract
  removeElevatorFromContract: (contractId, elevatorId) => 
    apiClient.delete(`/contracts/${contractId}/elevators/${elevatorId}`),
  
  // Get contract documents
  getContractDocuments: (contractId) => apiClient.get(`/contracts/${contractId}/documents`),
  
  // Upload contract document
  uploadContractDocument: (contractId, formData) => 
    apiClient.post(`/contracts/${contractId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // Delete contract document
  deleteContractDocument: (contractId, documentId) => 
    apiClient.delete(`/contracts/${contractId}/documents/${documentId}`),
  
  // Check contract coverage
  checkContractCoverage: (contractId, data) => 
    apiClient.post(`/contracts/${contractId}/check-coverage`, data),
  
  // Activate contract
  activateContract: (contractId) => apiClient.patch(`/contracts/${contractId}/activate`),
  
  // Deactivate (suspend) contract
  suspendContract: (contractId) => apiClient.patch(`/contracts/${contractId}/deactivate`),
  
  // Export contracts
  exportContracts: (params) => 
    apiClient.get('/contracts/export', { 
      params,
      responseType: 'blob'
    }),
  
  // Get expiring contracts
  getExpiringContracts: (days = 30) => 
    apiClient.get('/contracts/expiring', { params: { days } }),
};