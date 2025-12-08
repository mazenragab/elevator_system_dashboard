import { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Wrench,
  Calendar,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  X,
  RefreshCw,
  Download
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Loading from '../ui/Loading';
import Modal from '../ui/Modal';
import Input from '../forms/Input';
import Select from '../forms/Select';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setPagination
  } = useNotifications();
  
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const notificationTypes = {
    REQUEST_CREATED: {
      label: 'طلب جديد',
      color: 'bg-blue-100 text-blue-800',
      icon: <AlertCircle className="w-4 h-4" />,
      badgeColor: 'bg-blue-500'
    },
    REQUEST_ASSIGNED: {
      label: 'تم تعيين فني',
      color: 'bg-green-100 text-green-800',
      icon: <Users className="w-4 h-4" />,
      badgeColor: 'bg-green-500'
    },
    REQUEST_STATUS_CHANGED: {
      label: 'تغيير الحالة',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <RefreshCw className="w-4 h-4" />,
      badgeColor: 'bg-yellow-500'
    },
    REPORT_SUBMITTED: {
      label: 'تقرير جديد',
      color: 'bg-purple-100 text-purple-800',
      icon: <FileText className="w-4 h-4" />,
      badgeColor: 'bg-purple-500'
    },
    CONTRACT_EXPIRING: {
      label: 'عقد منتهي',
      color: 'bg-red-100 text-red-800',
      icon: <Calendar className="w-4 h-4" />,
      badgeColor: 'bg-red-500'
    },
    MAINTENANCE_DUE: {
      label: 'صيانة دورية',
      color: 'bg-orange-100 text-orange-800',
      icon: <Wrench className="w-4 h-4" />,
      badgeColor: 'bg-orange-500'
    },
    SYSTEM_NOTIFICATION: {
      label: 'إشعار نظام',
      color: 'bg-gray-100 text-gray-800',
      icon: <Bell className="w-4 h-4" />,
      badgeColor: 'bg-gray-500'
    }
  };

  // تصفية الإشعارات
  const filteredNotifications = notifications.filter(notification => {
    // تصفية حسب النص
    const matchesSearch = searchTerm === '' ||
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // تصفية حسب النوع
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    // تصفية حسب حالة القراءة
    const matchesRead = filterRead === 'all' ||
      (filterRead === 'read' && notification.isRead) ||
      (filterRead === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);

  const handleMarkAsRead = async (notificationId) => {
    setActionLoading(notificationId);
    try {
      await markAsRead(notificationId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    
    setActionLoading(notificationId);
    try {
      await deleteNotification(notificationId);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    
    // تعليم كمقروء إذا كان غير مقروء
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      const nextPage = pagination.page + 1;
      setPagination(prev => ({ ...prev, page: nextPage }));
      fetchNotifications({ page: nextPage });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    if (diffDays < 7) return `قبل ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <Card className="p-6 shadow-sm">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* زر الإشعارات في Navbar */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="الإشعارات"
      >
        <div className="relative">
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* قائمة الإشعارات */}
      {showNotifications && (
        <div className="fixed md:absolute right-0 md:right-0 top-full md:top-12 mt-2 w-full md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden">
          {/* رأس الإشعارات */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-gray-600 ml-2" />
                <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                {unreadCount > 0 && (
                  <span className="mr-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-1"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="p-1 text-sm"
                  >
                    <CheckCheck className="w-4 h-4 ml-1" />
                    تعليم الكل كمقروء
                  </Button>
                )}
              </div>
            </div>

            {/* البحث والتصفية */}
            <div className="mt-4 space-y-2">
              <Input
                placeholder="ابحث في الإشعارات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="text-sm"
              />
              
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  options={[
                    { value: 'all', label: 'كل الأنواع' },
                    ...Object.entries(notificationTypes).map(([value, config]) => ({
                      value,
                      label: config.label
                    }))
                  ]}
                  className="text-sm"
                />
                
                <Select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                  options={[
                    { value: 'all', label: 'الكل' },
                    { value: 'unread', label: 'غير مقروء' },
                    { value: 'read', label: 'مقروء' }
                  ]}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* قائمة الإشعارات */}
          <div className="overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="p-8 text-center">
                <Loading size="md" />
                <p className="mt-2 text-sm text-gray-500">جاري تحميل الإشعارات...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-2 text-gray-500">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const typeConfig = notificationTypes[notification.type] || notificationTypes.SYSTEM_NOTIFICATION;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleViewDetails(notification)}
                    >
                      <div className="flex gap-3">
                        {/* بادج النوع */}
                        <div className={`${typeConfig.color} w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          {typeConfig.icon}
                        </div>
                        
                        {/* محتوى الإشعار */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {notification.title}
                            </h4>
                            <span className="text-xs text-gray-500 flex-shrink-0 mr-2">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                            {notification.message}
                          </p>
                          
                          {/* أزرار الإجراءات */}
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                disabled={actionLoading === notification.id}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {actionLoading === notification.id ? (
                                  <Loading size="xs" />
                                ) : (
                                  <>
                                    <Check className="w-3 h-3 ml-1" />
                                    تعليم كمقروء
                                  </>
                                )}
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                              disabled={actionLoading === notification.id}
                              className="text-red-600 hover:text-red-800"
                            >
                              {actionLoading === notification.id ? (
                                <Loading size="xs" />
                              ) : (
                                <>
                                  <Trash2 className="w-3 h-3 ml-1" />
                                  حذف
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* مؤشر القراءة */}
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 ${typeConfig.badgeColor} rounded-full`} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* تذييل */}
          {!loading && pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLoadMore}
                disabled={pagination.page >= pagination.totalPages}
              >
                <ChevronDown className="w-4 h-4 ml-2" />
                تحميل المزيد
              </Button>
            </div>
          )}
        </div>
      )}

      {/* زر الإشعارات في Sidebar */}
      <button 
        onClick={() => {
          // إذا كان في Sidebar، افتح الصفحة الكاملة
          window.location.href = '/notifications';
        }}
        className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white w-full transition-all text-right"
      >
        <Bell size={18} className="flex-shrink-0 sm:w-5 sm:h-5" />
        <span className="font-medium flex-1 text-xs sm:text-sm truncate">الإشعارات</span>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* مودال تفاصيل الإشعار */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="تفاصيل الإشعار"
        size="md"
      >
        {selectedNotification && (
          <div className="space-y-4">
            {/* عنوان الإشعار */}
            <div className="flex items-start gap-3">
              <div className={`${notificationTypes[selectedNotification.type]?.color || 'bg-gray-100'} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                {notificationTypes[selectedNotification.type]?.icon || <Bell className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedNotification.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedNotification.createdAt)}
                </p>
              </div>
            </div>

            {/* رسالة الإشعار */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 whitespace-pre-line">
                {selectedNotification.message}
              </p>
            </div>

            {/* بيانات إضافية */}
            {selectedNotification.data && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">معلومات إضافية:</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* أزرار الإجراءات */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
                className="flex-1"
              >
                إغلاق
              </Button>
              
              {selectedNotification.relatedId && selectedNotification.relatedType && (
                <Button
                  variant="primary"
                  onClick={() => {
                    // التنقل للكيان ذي الصلة
                    const routeMap = {
                      'MAINTENANCE_REQUEST': `/requests/${selectedNotification.relatedId}`,
                      'MAINTENANCE_REPORT': `/reports/${selectedNotification.relatedId}`,
                      'CONTRACT': `/contracts/${selectedNotification.relatedId}`,
                      'ELEVATOR': `/elevators/${selectedNotification.relatedId}`
                    };
                    
                    const route = routeMap[selectedNotification.relatedType];
                    if (route) {
                      window.location.href = route;
                    }
                  }}
                  className="flex-1"
                >
                  <ChevronRight className="w-4 h-4 ml-2" />
                  الانتقال للكيان
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Backdrop للقائمة المنسدلة */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default Notifications;