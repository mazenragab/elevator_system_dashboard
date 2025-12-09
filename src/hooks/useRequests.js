// Modified useRequests.js
import { useState, useEffect, useCallback } from 'react';
import { maintenanceService } from '../services/maintenanceService';

export const useRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 1000, // Increased limit to fetch all (assuming up to 100 is sufficient for 38 items)
    totalPages: 1
  });
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Always fetch with a high limit to get all data at once, ignoring page for front-end pagination
      const fetchParams = { ...params, limit: params.limit || 100 };
      delete fetchParams.page; // Remove page to fetch all in one go if backend supports it
      
      const response = await maintenanceService.getAllRequests(fetchParams);
      
      if (response.data) {
        setRequests(response.data.requests || []);
        
        if (response.data?.pagination) {
          setPagination({
            total: response.data.pagination.total,
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            totalPages: response.data.pagination.totalPages
          });
        } else {
          // If no pagination from backend, set based on fetched data
          setPagination({
            total: response.data.requests.length,
            page: 1,
            limit: response.data.requests.length,
            totalPages: 1
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = () => {
    fetchRequests();
  };

  const fetchRequestById = async (id) => {
    try {
      const response = await maintenanceService.getRequestById(id);
      if (response.data) {
        const request = response.data;
        setSelectedRequest(request);
        return request;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const createRequest = async (requestData) => {
    try {
      const response = await maintenanceService.createRequest(requestData);
      if (response.data?.success) {
        await fetchRequests();
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updateRequest = async (id, updateData) => {
    try {
      const response = await maintenanceService.updateRequest(id, updateData);
      if (response.data) {
        await fetchRequests();
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteRequest = async (id) => {
    try {
      const response = await maintenanceService.deleteRequest(id);
      if (response.data?.success) {
        await fetchRequests();
        return true;
      }
      return false;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const assignTechnician = async (id, technicianId) => {
    try {
      const response = await maintenanceService.assignTechnician(id, technicianId);
      if (response.data) {
        await fetchRequests();
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await maintenanceService.updateRequestStatus(id, status);
      if (response.data) {
        await fetchRequests();
        return response.data.data;
      }
      return null;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };


  const updatePagination = (params) => {
    // Since pagination is now front-end only, just update local state without refetch
    setPagination(prev => ({
      ...prev,
      page: params.page
    }));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    error,
    pagination,
    selectedRequest,
    fetchRequests,
    fetchRequestById,
    createRequest,
    updateRequest,
    deleteRequest,
    assignTechnician,
    updateStatus,
    refetch,
    updatePagination,
    setSelectedRequest
  };
};