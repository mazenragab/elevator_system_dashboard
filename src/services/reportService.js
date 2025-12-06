import apiClient from './apiClient';

export const reportService = {
  // الحصول على جميع التقارير مع فلترة
  getAllReports: (params) => apiClient.get('/reports', { params }),
  
  // الحصول على إحصائيات التقارير
  getReportsStatistics: (params) => apiClient.get('/reports/statistics', { params }),
  
  // الحصول على تقرير بواسطة معرّف الطلب
  getReportByRequest: (requestId) => apiClient.get(`/reports/request/${requestId}`),
  
  // الحصول على تقرير بواسطة المعرّف
  getReportById: (id) => apiClient.get(`/reports/${id}`),
  
  // الحصول على التقارير الخاصة بالفني
  getTechnicianReports: (params) => apiClient.get('/reports/technician/my-reports', { params }),
  
  // الحصول على تقارير الصيانة للمصعد
  getElevatorReports: (elevatorId, params) => apiClient.get(`/reports/elevator/${elevatorId}`, { params }),
  
  // الحصول على تقارير العميل
  getClientReports: (clientId, params) => apiClient.get(`/reports/client/${clientId}`, { params }),
  
  // الحصول على تقارير الفني
  getTechnicianSpecificReports: (technicianId, params) => apiClient.get(`/reports/technician/${technicianId}`, { params }),
  
  // تصدير التقرير
  exportReport: (id, format = 'pdf') => apiClient.get(`/reports/${id}/export`, { 
    params: { format },
    responseType: 'blob'
  }),
  
  // الحصول على تحليل المشاكل
  getProblemAnalysis: (params) => apiClient.get('/reports/analysis/problems', { params }),
  
  // الحصول على تحليل الأداء
  getPerformanceAnalysis: (params) => apiClient.get('/reports/analysis/performance', { params }),
};