import { useState, useEffect, useCallback } from 'react';
import { managerService } from '../services/managerService';
import { contractService } from '../services/contractService'; // إضافة الاستيراد

export const useContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [selectedContractDetails, setSelectedContractDetails] = useState(null);

  const fetchContracts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدام خدمة العقود بدلاً من خدمة المدير مباشرة
      const response = await contractService.getAllContracts({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...params
      });
      
      if (response.data) {
        setContracts(response.data);
        setPagination({
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 1
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);
  const fetchContractById = async (id) => {
    try {
      setLoading(true);
      const response = await managerService.getContractById(id);
      setSelectedContractDetails(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData) => {
    try {
      const response = await managerService.addContract(contractData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const updateContract = async (id, contractData) => {
    try {
      const response = await managerService.updateContract(id, contractData);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteContract = async (id) => {
    try {
      const response = await managerService.deleteContract(id);
      return response.data;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchContracts({ page: newPage });
  };

  const changeLimit = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
    fetchContracts({ limit: newLimit, page: 1 });
  };

  return {
    contracts,
    loading,
    error,
    pagination,
    selectedContractDetails,
    setSelectedContractDetails,
    fetchContracts,
    fetchContractById,
    createContract,
    updateContract,
    deleteContract,
    changePage,
    changeLimit,
    refetch: fetchContracts
  };
};