import { useState, useEffect, useCallback } from 'react';
import { technicianService } from '../services/technicianService';

export const useTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 1000,
    totalPages: 1
  });
  const [selectedTechnicianDetails, setSelectedTechnicianDetails] = useState(null);

  const fetchTechnicians = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await technicianService.getAllTechnicians(params);
      
      if (response.data) {
        setTechnicians(response.data || []); // هنا عدلت
        console.log('Technicians data:', response.data);
        
        // تحديث بيانات الترقيم من الـ meta
        if (response.meta) { // هنا عدلت
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
      console.error('Error fetching technicians:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableTechnicians = async () => {
    try {
      const response = await technicianService.getAvailableTechnicians();
      if (response.data) {
        setAvailableTechnicians(response.data || []); // هنا عدلت
        console.log('Available technicians:', response.data);
      }
      return response.data?.data || [];
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const fetchTechnicianById = async (id) => {
    try {
      setSelectedTechnicianDetails(null); // إعادة تعيين قبل جلب البيانات الجديدة
      const response = await technicianService.getTechnicianById(id);
      const data = response.data ? response.data : null; // هنا عدلت
      setSelectedTechnicianDetails(data);
      console.log('Technician details:', data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // إزالة fetchTechnicianPerformance إذا لم تكن مستخدمة

  const createTechnician = async (technicianData) => {
    try {
      const response = await technicianService.addTechnician(technicianData);
      if (response.data?.success) {
        await fetchTechnicians();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteTechnician = async (id) => {
    try {
      const response = await technicianService.deleteTechnician(id);
      if (response.data?.success) {
        await fetchTechnicians();
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  // تحميل الفنيين والمتاحين عند التحميل الأول
  useEffect(() => {
    fetchTechnicians();
    fetchAvailableTechnicians();
  }, []);

  return {
    technicians,
    loading,
    error,
    availableTechnicians,
    pagination,
    selectedTechnicianDetails,
    fetchTechnicians,
    fetchAvailableTechnicians,
    fetchTechnicianById,
    createTechnician,
    deleteTechnician,
    refetch: fetchTechnicians,
    setSelectedTechnicianDetails
  };
};