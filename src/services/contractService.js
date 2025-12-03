
import apiClient from "./apiClient";
export const contractService = {
  // For Manager + Client
  getAllContracts: (params) => apiClient.get('/contracts', { params }), 
};