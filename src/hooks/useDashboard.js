import { useState, useEffect, useCallback } from 'react';
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

  const fetchDashboard = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // استخدم getStats بدلاً من Promise.all لتجنب كثرة الطلبات
      const statsResponse = await managerService.getStats();
      
      if (statsResponse.data) {
        const statsData = statsResponse.data;
        setDashboardData(statsData);
        setStats(statsData);
      }
    } catch (err) {
      setError(err.message || 'فشل تحميل بيانات لوحة التحكم');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const response = await managerService.getPendingRequests();
      
      if (response.data) {
        setPendingRequests(response.data);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  }, []);

  const fetchAnalytics = useCallback(async (type, params = {}) => {
    try {
      setLoading(true);
      
      let response;
      switch (type) {
        case 'requests':
          response = await managerService.getRequestsAnalytics(params);
          setAnalytics(prev => ({ ...prev, requests: response.data }));
          break;
        case 'clients':
          response = await managerService.getClientsAnalytics(params);
          setAnalytics(prev => ({ ...prev, clients: response.data }));
          break;
        case 'elevators':
          response = await managerService.getElevatorsAnalytics(params);
          setAnalytics(prev => ({ ...prev, elevators: response.data }));
          break;
        case 'technicians':
          response = await managerService.getTechnicians(params);
          setAnalytics(prev => ({ ...prev, technicians: response.data }));
          break;
        default:
          throw new Error('Invalid analytics type');
      }
      
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllAnalytics = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      
      const [requests, clients, elevators] = await Promise.all([
        managerService.getRequestsAnalytics(params),
        managerService.getClientsAnalytics(params),
        managerService.getElevatorsAnalytics(params)
      ]);
      
      setAnalytics({
        requests: requests.data,
        clients: clients.data,
        elevators: elevators.data,
        technicians: null
      });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchPendingRequests();
    
    // تأخير جلب التحليلات لتجنب 429
    const timer = setTimeout(() => {
      fetchAllAnalytics();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fetchDashboard, fetchPendingRequests, fetchAllAnalytics]);

  return {
    dashboardData,
    stats,
    pendingRequests,
    analytics,
    loading,
    error,
    fetchDashboard,
    fetchAnalytics,
    fetchAllAnalytics,
    fetchPendingRequests,
    refetch: fetchDashboard
  };
};