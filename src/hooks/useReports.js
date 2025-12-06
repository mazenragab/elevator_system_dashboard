import { useState, useEffect, useCallback } from 'react';
import { reportService } from '../services/reportService';

export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [problemAnalysis, setProblemAnalysis] = useState([]);
  const [performanceAnalysis, setPerformanceAnalysis] = useState([]);

  const fetchReports = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getAllReports(params);
      
      if (response.data) {
        const reportsData = response.data.reports || response.data || [];
        setReports(reportsData);
        
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
      setError(err.response?.data?.message || err.message || 'حدث خطأ في تحميل التقارير');
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async (params = {}) => {
    try {
      const response = await reportService.getReportsStatistics(params);
      if (response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  }, []);

  const fetchReportById = async (id) => {
    try {
      setSelectedReport(null);
      const response = await reportService.getReportById(id);
      const data = response.data ? response.data : null;
      setSelectedReport(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const fetchProblemAnalysis = useCallback(async (params = {}) => {
    try {
      const response = await reportService.getProblemAnalysis(params);
      if (response.data) {
        setProblemAnalysis(response.data);
      }
    } catch (err) {
      console.error('Error fetching problem analysis:', err);
    }
  }, []);

  const fetchPerformanceAnalysis = useCallback(async (params = {}) => {
    try {
      const response = await reportService.getPerformanceAnalysis(params);
      if (response.data) {
        setPerformanceAnalysis(response.data);
      }
    } catch (err) {
      console.error('Error fetching performance analysis:', err);
    }
  }, []);

  const exportReport = async (id, format = 'pdf') => {
    try {
      const response = await reportService.exportReport(id, format);
      
      // إنشاء رابط لتحميل الملف
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (err) {
      console.error('Error exporting report:', err);
      throw err;
    }
  };

  const fetchReportsByElevator = async (elevatorId, params = {}) => {
    try {
      setLoading(true);
      const response = await reportService.getElevatorReports(elevatorId, params);
      if (response.data) {
        setReports(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsByClient = async (clientId, params = {}) => {
    try {
      setLoading(true);
      const response = await reportService.getClientReports(clientId, params);
      if (response.data) {
        setReports(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsByTechnician = async (technicianId, params = {}) => {
    try {
      setLoading(true);
      const response = await reportService.getTechnicianSpecificReports(technicianId, params);
      if (response.data) {
        setReports(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchStatistics();
    fetchProblemAnalysis();
    fetchPerformanceAnalysis();
  }, []);

  return {
    reports,
    loading,
    error,
    statistics,
    pagination,
    selectedReport,
    problemAnalysis,
    performanceAnalysis,
    fetchReports,
    fetchReportById,
    fetchStatistics,
    fetchProblemAnalysis,
    fetchPerformanceAnalysis,
    exportReport,
    fetchReportsByElevator,
    fetchReportsByClient,
    fetchReportsByTechnician,
    setSelectedReport,
  };
};