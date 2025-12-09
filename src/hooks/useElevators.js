import { useState, useEffect, useCallback } from 'react';
import { elevatorService } from '../services/elevatorService';
import { clientService } from '../services/clientService';

export const useElevators = () => {
  const [elevators, setElevators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 100,
    totalPages: 1
  });
  const [selectedElevatorDetails, setSelectedElevatorDetails] = useState(null);
  const [clients, setClients] = useState([]);

  const fetchElevators = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await elevatorService.getAllElevators(params);
      
      if (response.data) {
        // تعديل هنا: response.data قد يحتوي على elevators مباشرة أو كجزء من object
        const elevatorsData = response.data.elevators || response.data || [];
        setElevators(elevatorsData);
        console.log('Elevators data:', elevatorsData);
        
        // تحديث بيانات الترقيم من الـ meta أو pagination
        if (response.meta) {
          setPagination({
            total: response.meta.total,
            page: response.meta.page,
            limit: response.meta.limit,
            totalPages: response.meta.totalPages
          });
        } else if (response.data.pagination) {
          setPagination({
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            totalPages: response.data.pagination.totalPages
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching elevators:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const response = await clientService.getAllClients();
      if (response.data) {
        const clientsData = response.data || [];
        setClients(clientsData);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  }, []);

  const fetchElevatorById = async (id) => {
    try {
      setSelectedElevatorDetails(null);
      const response = await elevatorService.getElevatorById(id);
      const data = response.data ? response.data : null;
      setSelectedElevatorDetails(data);
      console.log('Elevator details:', data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const fetchElevatorStats = async (id) => {
    try {
      const response = await elevatorService.getElevatorStats(id);
      return response.data || null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const createElevator = async (elevatorData) => {
    try {
      console.log('Creating elevator with data:', elevatorData);
      
      const response = await elevatorService.addElevator(elevatorData);
      
      if (response.success || response.data?.success) {
        await fetchElevators();
        return response.data || response;
      }
      
      throw new Error(response.message || 'فشل إضافة المصعد');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updateElevator = async (id, elevatorData) => {
    try {
      console.log('Updating elevator with data:', elevatorData);
      
      const response = await elevatorService.updateElevator(id, elevatorData);
      
      if (response.success || response.data?.success) {
        await fetchElevators();
        return response.data || response;
      }
      
      throw new Error(response.message || 'فشل تحديث المصعد');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteElevator = async (id) => {
    try {
      const response = await elevatorService.deleteElevator(id);
      if (response.success || response.data?.success) {
        await fetchElevators();
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // تحميل المصاعد والعملاء عند التحميل الأول
  useEffect(() => {
    fetchElevators();
    fetchClients();
  }, [fetchElevators]);

  return {
    elevators,
    loading,
    error,
    clients,
    pagination,
    selectedElevatorDetails,
    fetchElevators,
    fetchElevatorById,
    fetchElevatorStats,
    createElevator,
    updateElevator,
    deleteElevator,
    refetch: fetchElevators,
    setSelectedElevatorDetails
  };
};