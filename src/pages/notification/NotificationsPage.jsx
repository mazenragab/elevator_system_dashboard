import { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  X,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Wrench
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/forms/Input';
import Select from '../../components/forms/Select';
import Loading from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../hooks/useToast';

const NotificationsPage = () => {
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
  
  const { showToast } = useToast();
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  const notificationTypes = {
    REQUEST_CREATED: {
      label: 'طلب صيانة جديد',
      color: 'bg-blue-100 text-blue-800',
      icon: <AlertCircle className="w-4 h-4" />,
      description: 'إشعارات إنشاء طلبات صيانة جديدة'
    },
    REQUEST_ASSIGNED: {
      label: 'تعيين فني للطلب',
      color: 'bg-green-100 text-green-800',
      icon: <Users className="w-4 h-4" />,
      description: 'إشعارات تعيين فني لطلبات الصيانة'
    },
    REQUEST_STATUS_CHANGED: {
      label: 'تغيير حالة الطلب',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <RefreshCw className="w-4 h-4" />,
      description: 'إشعارات تغيير حالات الطلبات'
    },
    REPORT_SUBMITTED: {
      label: 'تقرير صيانة جديد',
      color: 'bg-purple-100 text-purple-800',
      icon: <FileText className="w-4 h-4" />,
      description: 'إشعارات رفع تقارير الصيانة'
    },
    CONTRACT_EXPIRING: {
      label: 'عقد قرب ينتهي',
      color: 'bg-red-100 text-red-800',
      icon: <Calendar className="w-4 h-4" />,
      description: 'إشعارات انتهاء العقود'
    },
    MAINTENANCE_DUE: {
      label: 'صيانة دورية مستحقة',
      color: 'bg-orange-100 text-orange-800',
      icon: <Wrench className="w-4 h-4" />,
      description: 'إشعارات الصيانة الدورية المستحقة'
    },
    SYSTEM_NOTIFICATION: {
      label: 'إشعار نظام',
      color: 'bg-gray-100 text-gray-800',
      icon: <Bell className="w-4 h-4" />,
      description: 'إشعارات النظام العامة'
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
    
    // تصفية حسب التاريخ
    const matchesDate = filterDate === 'all' || checkDateFilter(notification.createdAt, filterDate);
    
    return matchesSearch && matchesType && matchesRead && matchesDate;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);

  const checkDateFilter = (dateString, filter) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    switch (filter) {
      case 'today':
        return diffDays === 0;
      case 'week':
        return diffDays <= 7;
      case 'month':
        return diffDays <= 30;
      case 'older':
        return diffDays > 30;
      default:
        return true;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setActionLoading(notificationId);
    try {
      await markAsRead(notificationId);
      showToast('تم تعليم الإشعار كمقروء', 'success');
    } catch (err) {
      showToast('فشل في تحديث الإشعار', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSelectedAsRead = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      const promises = Array.from(selectedNotifications).map(id => markAsRead(id));
      await Promise.all(promises);
      setSelectedNotifications(new Set());
      showToast(`تم تعليم ${selectedNotifications.size} إشعار كمقروء`, 'success');
    } catch (err) {
      showToast('فشل في تحديث الإشعارات', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    
    setActionLoading(notificationId);
    try {
      await deleteNotification(notificationId);
      showToast('تم حذف الإشعار بنجاح', 'success');
    } catch (err) {
      showToast('فشل في حذف الإشعار', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;
    
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedNotifications.size} إشعار؟`)) return;
    
    try {
      const promises = Array.from(selectedNotifications).map(id => deleteNotification(id));
      await Promise.all(promises);
      setSelectedNotifications(new Set());
      showToast(`تم حذف ${selectedNotifications.size} إشعار`, 'success');
    } catch (err) {
      showToast('فشل في حذف الإشعارات', 'error');
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

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      const allIds = filteredNotifications.map(n => n.id);
      setSelectedNotifications(new Set(allIds));
    }
  };

  const handleSelectNotification = (notificationId) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportNotifications = () => {
    const data = filteredNotifications.map(notification => ({
      type: notificationTypes[notification.type]?.label || notification.type,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead ? 'مقروء' : 'غير مقروء',
      date: formatDate(notification.createdAt)
    }));
    
    const csv = [
      ['النوع', 'العنوان', 'الرسالة', 'الحالة', 'التاريخ'],
      ...data.map(item => [item.type, item.title, item.message, item.isRead, item.date])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `notifications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('تم تصدير الإشعارات بنجاح', 'success');
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <PageHeader
          title="الإشعارات"
          subtitle="إدارة إشعارات النظام"
        />
        
        <Card className="shadow-sm">
          <EmptyState
            icon={<Bell className="w-16 h-16 text-gray-300" />}
            title="حدث خطأ"
            description={error}
            actionLabel="إعادة المحاولة"
            onAction={handleRefresh}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* العنوان */}
      <PageHeader
        title="الإشعارات"
        subtitle="إدارة إشعارات النظام"
        action={
          <div className="flex gap-2">
            {selectedNotifications.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                >
                  <CheckCheck className="w-4 h-4 ml-2" />
                  تعليم المحدد كمقروء
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  حذف المحدد
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportNotifications}
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        }
      />

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {notifications.length}
              </p>
              <p className="text-xs md:text-sm text-blue-600 font-medium mt-1">إجمالي الإشعارات</p>
            </div>
            <div className="p-2 md:p-3 bg-blue-50 rounded-lg md:rounded-xl">
              <Bell className="text-blue-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {unreadCount}
              </p>
              <p className="text-xs md:text-sm text-red-600 font-medium mt-1">غير مقروء</p>
            </div>
            <div className="p-2 md:p-3 bg-red-50 rounded-lg md:rounded-xl">
              <Bell className="text-red-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {Object.keys(notificationTypes).length}
              </p>
              <p className="text-xs md:text-sm text-purple-600 font-medium mt-1">أنواع الإشعارات</p>
            </div>
            <div className="p-2 md:p-3 bg-purple-50 rounded-lg md:rounded-xl">
              <Filter className="text-purple-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 md:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {unreadNotifications.length}
              </p>
              <p className="text-xs md:text-sm text-green-600 font-medium mt-1">غير مقروء (مصفى)</p>
            </div>
            <div className="p-2 md:p-3 bg-green-50 rounded-lg md:rounded-xl">
              <Bell className="text-green-600 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* فلترة متقدمة */}
      <Card className="p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="ابحث في الإشعارات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="md:col-span-2"
          />
          
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
          />
          
          <Select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            options={[
              { value: 'all', label: 'كل التواريخ' },
              { value: 'today', label: 'اليوم' },
              { value: 'week', label: 'آخر أسبوع' },
              { value: 'month', label: 'آخر شهر' },
              { value: 'older', label: 'أقدم من شهر' }
            ]}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            options={[
              { value: 'all', label: 'الكل' },
              { value: 'unread', label: 'غير مقروء فقط' },
              { value: 'read', label: 'مقروء فقط' }
            ]}
          />
          
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadNotifications.length === 0}
              className="flex-1"
            >
              <CheckCheck className="w-4 h-4 ml-2" />
              تعليم الكل كمقروء
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterRead('all');
                setFilterDate('all');
              }}
              className="flex-1"
            >
              <X className="w-4 h-4 ml-2" />
              مسح الفلاتر
            </Button>
          </div>
        </div>
      </Card>

      {/* قائمة الإشعارات */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm font-medium text-gray-700">تحديد الكل</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">العنوان</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الرسالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الحالة</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center">
                    <EmptyState
                      icon={<Bell className="w-12 h-12 text-gray-300" />}
                      title="لا توجد إشعارات"
                      description="لم يتم العثور على إشعارات تطابق معايير البحث"
                    />
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((notification) => {
                  const typeConfig = notificationTypes[notification.type] || notificationTypes.SYSTEM_NOTIFICATION;
                  
                  return (
                    <tr 
                      key={notification.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.has(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <div className={`${typeConfig.color} px-3 py-1 rounded-full flex items-center gap-1`}>
                            {typeConfig.icon}
                            <span className="text-xs font-medium">{typeConfig.label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-right">
                          <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                            {notification.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-right">
                          <p className="text-gray-600 text-sm line-clamp-2 max-w-[300px]">
                            {notification.message}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-right">
                          <p className="text-gray-500 text-sm">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            notification.isRead 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {notification.isRead ? 'مقروء' : 'غير مقروء'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleViewDetails(notification)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            عرض
                          </Button>
                          
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleMarkAsRead(notification.id)}
                              disabled={actionLoading === notification.id}
                              className="text-green-600 hover:text-green-800"
                            >
                              {actionLoading === notification.id ? (
                                <Loading size="xs" />
                              ) : (
                                'تعليم كمقروء'
                              )}
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleDeleteNotification(notification.id)}
                            disabled={actionLoading === notification.id}
                            className="text-red-600 hover:text-red-800"
                          >
                            {actionLoading === notification.id ? (
                              <Loading size="xs" />
                            ) : (
                              'حذف'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* تحميل المزيد */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={pagination.page >= pagination.totalPages}
            className="px-8"
          >
            تحميل المزيد ({pagination.page}/{pagination.totalPages})
          </Button>
        </div>
      )}

      {/* مودال تفاصيل الإشعار */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="تفاصيل الإشعار"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-6">
            {/* معلومات الإشعار */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">نوع الإشعار</label>
                  <div className="flex items-center justify-end">
                    <div className={`${notificationTypes[selectedNotification.type]?.color || 'bg-gray-100'} px-4 py-2 rounded-lg flex items-center gap-2`}>
                      {notificationTypes[selectedNotification.type]?.icon}
                      <span className="font-medium">{notificationTypes[selectedNotification.type]?.label}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">العنوان</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 font-medium">{selectedNotification.title}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">حالة القراءة</label>
                  <div className="flex justify-end">
                    <span className={`px-4 py-2 rounded-lg font-medium ${
                      selectedNotification.isRead 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedNotification.isRead ? 'مقروء' : 'غير مقروء'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">تاريخ الإنشاء</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{formatDate(selectedNotification.createdAt)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">تاريخ القراءة</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">
                      {selectedNotification.readAt 
                        ? formatDate(selectedNotification.readAt)
                        : 'لم يتم القراءة بعد'
                      }
                    </p>
                  </div>
                </div>
                
                {selectedNotification.relatedType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">الكيان ذو الصلة</label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900">
                        {selectedNotification.relatedType} #{selectedNotification.relatedId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* رسالة الإشعار */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">الرسالة</label>
              <div className="p-4 bg-gray-50 rounded-lg min-h-[100px]">
                <p className="text-gray-900 whitespace-pre-line">{selectedNotification.message}</p>
              </div>
            </div>

            {/* بيانات إضافية */}
            {selectedNotification.data && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">البيانات الإضافية</label>
                <div className="p-4 bg-gray-50 rounded-lg overflow-x-auto">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(selectedNotification.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* أزرار الإجراءات */}
            <div className="flex flex-col md:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
                className="w-full md:w-auto"
              >
                إغلاق
              </Button>
              
              {selectedNotification.relatedId && selectedNotification.relatedType && (
                <Button
                  variant="primary"
                  onClick={() => {
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
                  className="w-full md:w-auto"
                >
                  الانتقال للكيان ذي الصلة
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationsPage;