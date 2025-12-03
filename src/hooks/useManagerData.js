import { useState, useCallback } from 'react';
import { managerService } from '../services/managerService';

export const useManagerData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (serviceMethod, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await serviceMethod(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDashboardStats = () => fetchData(managerService.getDashboardStats);
  const fetchContracts = (params) => fetchData(managerService.getContracts, params);
  const fetchTechnicians = (params) => fetchData(managerService.getTechnicians, params);
  const fetchRequests = (params) => fetchData(managerService.getRequests, params);
  const fetchReports = (params) => fetchData(managerService.getReports, params);

  return {
    data,
    loading,
    error,
    fetchDashboardStats,
    fetchContracts,
    fetchTechnicians,
    fetchRequests,
    fetchReports,
    clearError: () => setError(null),
    clearData: () => setData(null)
  };
};