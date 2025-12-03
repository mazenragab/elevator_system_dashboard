import { useState, useEffect, useCallback } from 'react';
import { clientService } from '../services/clientService';

export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [selectedClientDetails, setSelectedClientDetails] = useState(null);

  const fetchClients = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await clientService.getAllClients(params);
      
      if (response.data) {
        setClients(response.data || []);
        console.log('Clients data:', response.data);
        
        // تحديث بيانات الترقيم من الـ meta
        if (response.meta) {
          setPagination({
            total: response.meta.total,
            page: response.meta.page,
            limit: response.meta.limit,
            totalPages: response.meta.totalPages
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClientById = async (id) => {
    try {
      setSelectedClientDetails(null);
      const response = await clientService.getClientById(id);
      const data = response.data ? response.data : null;
      setSelectedClientDetails(data);
      console.log('Client details:', data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const fetchClientStats = async (id) => {
    try {
      const response = await clientService.getClientStats(id);
      return response.data || null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const createClient = async (clientData) => {
    try {
      const response = await clientService.addClient(clientData);
      if (response.data?.success) {
        await fetchClients();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      const response = await clientService.updateClient(id, clientData);
      if (response.data?.success) {
        await fetchClients();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      const response = await clientService.deleteClient(id);
      if (response.data?.success) {
        await fetchClients();
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // تحميل العملاء عند التحميل الأول
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    pagination,
    selectedClientDetails,
    fetchClients,
    fetchClientById,
    fetchClientStats,
    createClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
    setSelectedClientDetails
  };
};