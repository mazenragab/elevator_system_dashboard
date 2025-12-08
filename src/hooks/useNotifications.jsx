import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { notificationService } from '../services/notificationService';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

// إنشاء Context للإشعارات
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Provider للإشعارات
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]); // حالة جديدة للإشعارات غير المقروءة
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingUnread, setLoadingUnread] = useState(false); // حالة تحميل جديدة
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  
  const { user } = useAuth();
  const { showToast } = useToast();

  // جلب الإشعارات
  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getNotifications({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        isRead: params.isRead,
        type: params.type
      });
      
      if (response.data) {
        const data = response.data;
        setNotifications(data.notifications || []);
        
        if (data.pagination) {
          setPagination({
            total: data.total,
            page: data.page,
            limit: data.limit,
            totalPages: data.totalPages
          });
        }
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في تحميل الإشعارات');
      console.error('❌ Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.data?.unreadCount !== undefined) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('❌ Error fetching unread count:', err);
    }
  }, []);

  // جلب الإشعارات غير المقروءة مع المحتوى (الجديد)
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      setLoadingUnread(true);
      const response = await notificationService.getUnreadNotifications();
      
      if (response.data?.notifications) {
        setUnreadNotifications(response.data.notifications);
      }
      
      // تحديث العدد أيضاً
      await fetchUnreadCount();
      
    } catch (err) {
      console.error('❌ Error fetching unread notifications:', err);
    } finally {
      setLoadingUnread(false);
    }
  }, []);

  // تعليم إشعار كمقروء
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      
      // تحديث القائمة المحلية
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      
      // إزالة من قائمة غير المقروءة
      setUnreadNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // تحديث العداد
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      showToast('تم تعليم الإشعار كمقروء', 'success');
      return response.data;
    } catch (err) {
      showToast('فشل في تحديث الإشعار', 'error');
      throw err;
    }
  }, [showToast]);

  // تعليم كل الإشعارات كمقروءة
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await notificationService.markAllAsRead();
      
      // تحديث القائمة المحلية
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString()
        }))
      );
      
      // إفراغ قائمة غير المقروءة
      setUnreadNotifications([]);
      
      // إعادة تعيين العداد
      setUnreadCount(0);
      
      showToast('تم تعليم جميع الإشعارات كمقروءة', 'success');
      return response.data;
    } catch (err) {
      showToast('فشل في تحديث الإشعارات', 'error');
      throw err;
    }
  }, [showToast]);

  // حذف إشعار
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // تحديث القائمة المحلية
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // إزالة من قائمة غير المقروءة
      setUnreadNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // تحديث العداد إذا كان غير مقروء
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      showToast('تم حذف الإشعار بنجاح', 'success');
    } catch (err) {
      showToast('فشل في حذف الإشعار', 'error');
      throw err;
    }
  }, [notifications, showToast]);

  // إضافة إشعار جديد
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    
    if (!notification.isRead) {
      setUnreadNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showNotificationAlert(notification);
    }
  }, []);

  // عرض تنبيه للمستخدم عند وصول إشعار جديد
  const showNotificationAlert = useCallback((notification) => {
    // طلب إذن الإشعارات إذا لم يتم طلبه من قبل
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // عرض إشعار المتصفح
    if (Notification.permission === 'granted') {
      try {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo.png',
          tag: `notification-${notification.id}`
        });
      } catch (err) {
        console.error('Failed to show browser notification:', err);
      }
    }
    
    // عرض Toast
    showToast(`${notification.title}: ${notification.message}`, 'info');
  }, [showToast]);

  // التحميل الأولي
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchUnreadNotifications(); // جلب الإشعارات غير المقروءة عند التحميل
      
      // طلب إذن الإشعارات
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [user, fetchNotifications, fetchUnreadNotifications]);

  // تحديث الإشعارات غير المقروءة دورياً
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchUnreadNotifications();
    }, 30000); // كل 30 ثانية

    return () => clearInterval(interval);
  }, [user, fetchUnreadNotifications]);

  const value = {
    notifications,
    unreadNotifications, // إضافة unreadNotifications إلى الـ context
    unreadCount,
    loading,
    loadingUnread, // إضافة loadingUnread
    error,
    pagination,
    fetchNotifications,
    fetchUnreadNotifications, // إضافة fetchUnreadNotifications
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    setNotifications,
    setUnreadNotifications,
    setUnreadCount,
    setPagination
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;