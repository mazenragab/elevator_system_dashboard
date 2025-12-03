import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../services/clientService';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchClients = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientService.getAllClients({
        page: pagination.page,
        limit: pagination.limit,
        ...params
      });
      console.log(response.data);
      
      if (response.data) {
        setClients(response.data);
        setPagination({
          page: response.meta.page || 1,
          limit: response.meta.limit || 10,
          total: response.meta.total || 0,
          totalPages: response.meta.totalPages || 1
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchClientById = async (id) => {
    try {
      setLoading(true);
      const response = await clientService.getClientById(id);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const changeLimit = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return {
    clients,
    loading,
    error,
    pagination,
    fetchClients,
    fetchClientById,
    changePage,
    changeLimit,
    refetch: fetchClients
  };
};