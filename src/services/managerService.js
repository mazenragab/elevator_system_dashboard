// src/services/managerService.js

import apiClient from './apiClient';

export const managerService = {
  // ============================================
  // Dashboard & Stats
  // ============================================
  
  /**
   * GET /api/manager/dashboard
   * الحصول على لوحة التحكم الكاملة (إحصائيات + طلبات معلقة + أنشطة)
   */
  getDashboard: (params) => apiClient.get('/manager/dashboard', { params }),
  
  /**
   * GET /api/manager/stats
   * الحصول على الإحصائيات فقط
   */
  getStats: (params) => apiClient.get('/manager/stats', { params }),
  
  /**
   * GET /api/manager/pending-requests
   * الحصول على جميع الطلبات المعلقة
   */
  getPendingRequests: () => apiClient.get('/manager/pending-requests'),
  
  // ============================================
  // Analytics
  // ============================================
  
  /**
   * GET /api/manager/analytics/requests
   * تحليلات الطلبات (حسب الحالة، الأولوية، النوع)
   */
  getRequestsAnalytics: (params) => 
    apiClient.get('/manager/analytics/requests', { params }),
  
  /**
   * GET /api/manager/analytics/clients
   * إحصائيات العملاء
   */
  getClientsAnalytics: (params) => 
    apiClient.get('/manager/analytics/clients', { params }),
  
  /**
   * GET /api/manager/analytics/elevators
   * إحصائيات المصاعد
   */
  getElevatorsAnalytics: (params) => 
    apiClient.get('/manager/analytics/elevators', { params }),
  
  /**
   * GET /api/manager/analytics/technicians
   * تحليلات أداء الفنيين
   */
  getTechniciansAnalytics: (params) => 
    apiClient.get('/manager/analytics/technicians', { params }),
  
  // ============================================
  // Reports
  // ============================================
  
  /**
   * GET /api/manager/reports
   * الحصول على التقارير
   * Query params:
   *   - type: requests|technicians|clients|elevators
   *   - format: json|csv|pdf
   *   - startDate, endDate
   */
  getReports: (params) => apiClient.get('/manager/reports', { params }),
  
  /**
   * POST /api/manager/reports/generate
   * إنشاء تقرير جديد
   */
  generateReport: (data) => apiClient.post('/manager/reports/generate', data),
  
  // ============================================
  // Contracts
  // ============================================
  
  /**
   * GET /api/manager/contracts
   * الحصول على جميع العقود
   */
  getContracts: (params) => apiClient.get('/manager/contracts', { params }),
  
  /**
   * GET /api/manager/contracts/:id
   * الحصول على عقد محدد
   */
  getContract: (id) => apiClient.get(`/manager/contracts/${id}`),
  
  /**
   * POST /api/manager/contracts
   * إنشاء عقد جديد
   */
  createContract: (data) => apiClient.post('/manager/contracts', data),
  
  /**
   * PUT /api/manager/contracts/:id
   * تحديث عقد
   */
  updateContract: (id, data) => apiClient.put(`/manager/contracts/${id}`, data),
  
  /**
   * DELETE /api/manager/contracts/:id
   * حذف عقد
   */
  deleteContract: (id) => apiClient.delete(`/manager/contracts/${id}`),
  
  // ============================================
  // Technicians
  // ============================================
  
  /**
   * GET /api/manager/technicians
   * الحصول على جميع الفنيين
   */
  getTechnicians: (params) => apiClient.get('/manager/technicians', { params }),
  
  /**
   * GET /api/manager/technicians/:id
   * الحصول على فني محدد
   */
  getTechnician: (id) => apiClient.get(`/manager/technicians/${id}`),
  
  /**
   * PUT /api/manager/technicians/:id
   * تحديث بيانات فني
   */
  updateTechnician: (id, data) => apiClient.put(`/manager/technicians/${id}`, data),
  
  // ============================================
  // Requests
  // ============================================
  
  /**
   * GET /api/manager/requests
   * الحصول على جميع الطلبات
   */
  getRequests: (params) => apiClient.get('/manager/requests', { params }),
  
  /**
   * GET /api/manager/requests/:id
   * الحصول على طلب محدد
   */
  getRequest: (id) => apiClient.get(`/manager/requests/${id}`),
  
  /**
   * POST /api/manager/requests
   * إنشاء طلب جديد
   */
  createRequest: (data) => apiClient.post('/manager/requests', data),
  
  /**
   * PUT /api/manager/requests/:id/assign
   * تعيين طلب لفني
   */
  assignRequest: (id, technicianId) => 
    apiClient.put(`/manager/requests/${id}/assign`, { technicianId }),
  
  /**
   * PUT /api/manager/requests/:id/status
   * تحديث حالة الطلب
   */
  updateRequestStatus: (id, status) =>
    apiClient.put(`/manager/requests/${id}/status`, { status }),
  
  // ============================================
  // Elevators
  // ============================================
  
  /**
   * GET /api/manager/elevators
   * الحصول على جميع المصاعد
   */
  getElevators: (params) => apiClient.get('/manager/elevators', { params }),
  
  /**
   * GET /api/manager/elevators/:id
   * الحصول على مصعد محدد
   */
  getElevator: (id) => apiClient.get(`/manager/elevators/${id}`),
  
  // ============================================
  // Clients
  // ============================================
  
  /**
   * GET /api/manager/clients
   * الحصول على جميع العملاء
   */
  getClients: (params) => apiClient.get('/manager/clients', { params }),
  
  /**
   * GET /api/manager/clients/:id
   * الحصول على عميل محدد
   */
  getClient: (id) => apiClient.get(`/manager/clients/${id}`)
};