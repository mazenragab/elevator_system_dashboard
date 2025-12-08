import apiClient from './apiClient';

export const notificationService = {
  // جلب الإشعارات
  getNotifications: (params) => apiClient.get('/notifications', { params }),
  
  // جلب عدد الإشعارات غير المقروءة
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),
  // جلب الإشعارات غير المقروءة
  getUnreadNotifications: () => apiClient.get('/notifications/unread'),
  // تعليم إشعار كمقروء
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  
  // تعليم كل الإشعارات كمقروءة
  markAllAsRead: () => apiClient.patch('/notifications/read-all'),
  
  // حذف إشعار
  deleteNotification: (id) => apiClient.delete(`/notifications/${id}`),
  
  // إشعارات الوظائف (للمدراء فقط)
  runContractExpiryCheck: () => apiClient.post('/notifications/jobs/contract-expiry'),
  runMaintenanceDueCheck: () => apiClient.post('/notifications/jobs/maintenance-due'),
  runCleanup: () => apiClient.post('/notifications/jobs/cleanup'),
};