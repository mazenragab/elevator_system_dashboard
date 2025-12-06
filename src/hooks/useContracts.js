import { useState, useEffect, useCallback } from 'react';
import { contractService } from '../services/contractService';

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
      
      // استخدام خدمة العقود الجديدة
      const response = await contractService.getAllContracts({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        clientId: params.clientId,
        isActive: params.isActive,
        contractType: params.contractType,
        search: params.search
      });
      
      if (response.data) {
        setContracts(response.data || response.data || []);
        setPagination({
          page: response.meta?.page || response.page || 1,
          limit: response.meta?.limit || response.limit || 10,
          total: response.meta?.total || response.total || 0,
          totalPages: response.meta?.totalPages || response.totalPages || 1
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ في تحميل العقود');
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const fetchContractById = async (id) => {
    try {
      setLoading(true);
      const response = await contractService.getContractById(id);
      setSelectedContractDetails(response.data || response.data);
      return response.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'حدث خطأ في تحميل العقد');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (contractData) => {
    try {
      const response = await contractService.createContract(contractData);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في إنشاء العقد');
    }
  };

  const updateContract = async (id, contractData) => {
    try {
      const response = await contractService.updateContract(id, contractData);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في تحديث العقد');
    }
  };

  const deleteContract = async (id) => {
    try {
      const response = await contractService.deleteContract(id);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في حذف العقد');
    }
  };

  const activateContract = async (id) => {
    try {
      const response = await contractService.activateContract(id);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في تفعيل العقد');
    }
  };

  const deactivateContract = async (id) => {
    try {
      const response = await contractService.suspendContract(id);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في تعطيل العقد');
    }
  };

  const getContractElevators = async (contractId) => {
    try {
      const response = await contractService.getContractElevators(contractId);
      console.log(response);
      
      return response.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في تحميل مصاعد العقد');
    }
  };

  const getContractDocuments = async (contractId) => {
    try {
      const response = await contractService.getContractDocuments(contractId);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في تحميل مستندات العقد');
    }
  };

  const uploadContractDocument = async (contractId, formData) => {
    try {
      const response = await contractService.uploadContractDocument(contractId, formData);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في رفع المستند');
    }
  };

  const deleteContractDocument = async (contractId, documentId) => {
    try {
      const response = await contractService.deleteContractDocument(contractId, documentId);
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في حذف المستند');
    }
  };

  const checkContractCoverage = async (contractId, elevatorId) => {
    try {
      const response = await contractService.checkContractCoverage(contractId, { elevatorId });
      return response.data.data || response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'حدث خطأ في التحقق من التغطية');
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
    activateContract,
    deactivateContract,
    getContractElevators,
    getContractDocuments,
    uploadContractDocument,
    deleteContractDocument,
    checkContractCoverage,
    changePage,
    changeLimit,
    refetch: fetchContracts
  };
};