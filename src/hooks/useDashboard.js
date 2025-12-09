// src/hooks/useDashboard.js

import { useState, useCallback } from 'react';
import { managerService } from '../services/managerService';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [analytics, setAnalytics] = useState({
    requests: null,
    clients: null,
    elevators: null,
    technicians: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * جلب بيانات Dashboard الكاملة
   */
  const fetchDashboard = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching dashboard data...');
      const response = await managerService.getDashboard(params);
      console.log('✅ Dashboard response:', response.data);
      
      if (response.data) {
        const data = response.data;
        
        // تعيين البيانات
        setDashboardData(data);
        setStats(data.stats);
        
        // التأكد من أن pendingRequests هو array
        if (data.pendingRequests) {
          if (Array.isArray(data.pendingRequests)) {
            setPendingRequests(data.pendingRequests);
            console.log('✅ Pending requests (array):', data.pendingRequests.length);
          } else if (data.pendingRequests.requests && Array.isArray(data.pendingRequests.requests)) {
            setPendingRequests(data.pendingRequests.requests);
            console.log('✅ Pending requests (nested):', data.pendingRequests.requests.length);
          } else {
            console.warn('⚠️ Pending requests not in expected format:', data.pendingRequests);
            setPendingRequests([]);
          }
        } else {
          console.warn('⚠️ No pending requests in dashboard response');
          // ✅ جلب الطلبات المعلقة من endpoint منفصل
          await fetchPendingRequests();
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل تحميل بيانات لوحة التحكم';
      setError(errorMessage);
      console.error('❌ Error fetching dashboard data:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      // تعيين قيم افتراضية في حالة الخطأ
      setStats(null);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * جلب الإحصائيات فقط
   */
  const fetchStats = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching stats...');
      const response = await managerService.getStats(params);
      console.log('✅ Stats response:', response.data);
      
      if (response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تحميل الإحصائيات');
      console.error('❌ Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * جلب الطلبات المعلقة
   */
  const fetchPendingRequests = useCallback(async () => {
    try {
      console.log('🔄 Fetching pending requests...');
      const response = await managerService.getPendingRequests();
      console.log('✅ Pending requests response:', response);
      console.log('Response data:', response.data);
      
      if (response.data) {
        // التعامل مع الشكل الجديد للـ API: {data: {requests: [], total: number}}
        let requestsArray = [];
        
        if (response.data.data && response.data.data.requests && Array.isArray(response.data.data.requests)) {
          // شكل: {data: {data: {requests: [...], total: X}}}
          requestsArray = response.data.data.requests;
          console.log('✅ Set pending requests (data.data.requests):', requestsArray.length, 'items');
        } else if (response.data.requests && Array.isArray(response.data.requests)) {
          // شكل: {data: {requests: [...], total: X}}
          requestsArray = response.data.requests;
          console.log('✅ Set pending requests (data.requests):', requestsArray.length, 'items');
        } else if (Array.isArray(response.data)) {
          // شكل: {data: [...]}
          requestsArray = response.data;
          console.log('✅ Set pending requests (array):', requestsArray.length, 'items');
        } else {
          console.warn('⚠️ Unexpected pending requests format:', response.data);
        }
        
        setPendingRequests(requestsArray);
      } else {
        console.warn('⚠️ No data in pending requests response');
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('❌ Error fetching pending requests:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        url: err.config?.url
      });
      setPendingRequests([]);
    }
  }, []);

  /**
   * جلب تحليلات محددة حسب النوع
   */
  const fetchAnalytics = useCallback(async (type, params = {}) => {
    try {
      setLoading(true);
      
      console.log(`🔄 Fetching ${type} analytics...`);
      let response;
      
      switch (type) {
        case 'requests':
          response = await managerService.getRequestsAnalytics(params);
          console.log('✅ Requests analytics:', response.data);
          setAnalytics(prev => ({ ...prev, requests: response.data }));
          break;
          
        case 'clients':
          response = await managerService.getClientsAnalytics(params);
          // التأكد من أن البيانات array
          const clientsData = Array.isArray(response.data) 
            ? response.data 
            : response.data?.clients || [];
          console.log('✅ Clients analytics:', clientsData.length, 'items');
          setAnalytics(prev => ({ ...prev, clients: clientsData }));
          break;
          
        case 'elevators':
          response = await managerService.getElevatorsAnalytics(params);
          console.log('✅ Elevators analytics:', response.data);
          setAnalytics(prev => ({ ...prev, elevators: response.data }));
          break;
          
        case 'technicians':
          response = await managerService.getTechniciansAnalytics(params);
          // التأكد من أن البيانات array
          const techniciansData = Array.isArray(response.data)
            ? response.data
            : response.data?.technicians || [];
          console.log('✅ Technicians analytics:', techniciansData.length, 'items');
          setAnalytics(prev => ({ ...prev, technicians: techniciansData }));
          break;
          
        default:
          throw new Error('Invalid analytics type');
      }
      
      return response.data;
    } catch (err) {
      console.error(`❌ Error fetching ${type} analytics:`, err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * جلب جميع التحليلات دفعة واحدة
   */
  const fetchAllAnalytics = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching all analytics...');
      
      const [requests, clients, elevators, technicians] = await Promise.all([
        managerService.getRequestsAnalytics(params).catch(err => {
          console.error('❌ Error fetching requests analytics:', err);
          return { data: null };
        }),
        managerService.getClientsAnalytics(params).catch(err => {
          console.error('❌ Error fetching clients analytics:', err);
          return { data: [] };
        }),
        managerService.getElevatorsAnalytics(params).catch(err => {
          console.error('❌ Error fetching elevators analytics:', err);
          return { data: null };
        }),
        managerService.getTechniciansAnalytics(params).catch(err => {
          console.error('❌ Error fetching technicians analytics:', err);
          return { data: [] };
        })
      ]);
      
      console.log('✅ All analytics fetched:', {
        requests: requests.data,
        clients: clients.data,
        elevators: elevators.data,
        technicians: technicians.data
      });
      
      setAnalytics({
        requests: requests.data,
        clients: Array.isArray(clients.data) ? clients.data : clients.data?.clients || [],
        elevators: elevators.data,
        technicians: Array.isArray(technicians.data) ? technicians.data : technicians.data?.technicians || []
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'فشل تحميل التحليلات');
      console.error('❌ Error fetching all analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * تحديث جميع البيانات
   */
  const refetch = useCallback(async () => {
    console.log('🔄 Refetching all data...');
    await Promise.all([
      fetchDashboard(),
      fetchPendingRequests(), // ✅ إضافة استدعاء صريح
      fetchAllAnalytics()
    ]);
    console.log('✅ All data refetched');
  }, [fetchDashboard, fetchPendingRequests, fetchAllAnalytics]);

  return {
    // Data
    dashboardData,
    stats,
    pendingRequests,
    analytics,
    
    // State
    loading,
    error,
    
    // Actions
    fetchDashboard,
    fetchStats,
    fetchPendingRequests,
    fetchAnalytics,
    fetchAllAnalytics,
    refetch
  };
};