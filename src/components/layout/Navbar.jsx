import { Search, Menu, ChevronDown, Bell, LogOut, User, AlertCircle, FileText, Users, Calendar, Wrench, Clock, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { 
    unreadNotifications, 
    unreadCount, 
    loadingUnread, 
    markAsRead 
  } = useNotifications();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    { icon: <User size={16} />, label: 'الملف الشخصي', onClick: () => navigate('/profile') },
    { icon: <LogOut size={16} />, label: 'تسجيل خروج', onClick: handleLogout, danger: true },
  ];

  const notificationTypes = {
    REQUEST_CREATED: {
      label: 'طلب جديد',
      color: 'bg-blue-100 text-blue-800',
      icon: <AlertCircle className="w-4 h-4" />
    },
    REQUEST_ASSIGNED: {
      label: 'تم تعيين فني',
      color: 'bg-green-100 text-green-800',
      icon: <Users className="w-4 h-4" />
    },
    REQUEST_STATUS_CHANGED: {
      label: 'تغيير الحالة',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <Clock className="w-4 h-4" />
    },
    REPORT_SUBMITTED: {
      label: 'تقرير جديد',
      color: 'bg-purple-100 text-purple-800',
      icon: <FileText className="w-4 h-4" />
    },
    CONTRACT_EXPIRING: {
      label: 'عقد قرب ينتهي',
      color: 'bg-red-100 text-red-800',
      icon: <Calendar className="w-4 h-4" />
    },
    MAINTENANCE_DUE: {
      label: 'صيانة دورية',
      color: 'bg-orange-100 text-orange-800',
      icon: <Wrench className="w-4 h-4" />
    },
    SYSTEM_NOTIFICATION: {
      label: 'إشعار نظام',
      color: 'bg-gray-100 text-gray-800',
      icon: <Bell className="w-4 h-4" />
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
    setShowNotifications(false); // إغلاق الإشعارات إذا كانت مفتوحة
  };

  const handleNotificationsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    setShowDropdown(false); // إغلاق الدروب داون إذا كان مفتوحاً
  };

  const handleMenuItemClick = (item) => {
    setShowDropdown(false);
    item.onClick();
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    setShowNotifications(false);
  };

  const handleMarkAsRead = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // يمكنك إضافة منطق للتنقل للكيان ذي الصلة
    setShowNotifications(false);
  };

  // دالة لتنسيق عرض العدد
  const formatUnreadCount = (count) => {
    if (count > 99) return '99+';
    return count.toString();
  };

  // دالة لتنسيق التاريخ
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 sticky top-0 z-30 w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* الجزء الأيسر */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
          {/* Mobile menu button */}
          <button 
            onClick={onMenuToggle}
            className="md:hidden text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="فتح القائمة"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* الجزء الأيمن */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
          {/* زر الإشعارات البسيط */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={handleNotificationsClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                  {formatUnreadCount(unreadCount)}
                </span>
              )}
            </button>

            {/* قائمة الإشعارات المختصرة */}
            {showNotifications && (
              <>
                {/* Backdrop للجوال */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
                  onClick={() => setShowNotifications(false)}
                />
                
                <div className="fixed md:absolute inset-x-0 md:inset-x-auto top-16 md:top-10 md:right-0 mt-2 w-full md:w-96 bg-white rounded-lg md:rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden mx-auto md:mx-0 max-w-[95vw] md:max-w-none">
                  {/* رأس الإشعارات */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Bell className="w-5 h-5 text-gray-700 ml-2" />
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">الإشعارات</h3>
                        {unreadCount > 0 && (
                          <span className="mr-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                            {formatUnreadCount(unreadCount)} جديد
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleViewAllNotifications}
                        className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium"
                      >
                        عرض الكل
                      </button>
                    </div>
                  </div>

                  {/* قائمة الإشعارات */}
                  <div className="overflow-y-auto max-h-[50vh]">
                    {loadingUnread ? (
                      <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-sm text-gray-500">جاري تحميل الإشعارات...</p>
                      </div>
                    ) : unreadNotifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto" />
                        <p className="mt-2 text-gray-500">لا توجد إشعارات جديدة</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {unreadNotifications.slice(0, 5).map((notification) => {
                          const typeConfig = notificationTypes[notification.type] || notificationTypes.SYSTEM_NOTIFICATION;
                          
                          return (
                            <div
                              key={notification.id}
                              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => handleNotificationClick(notification)}
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
                                  
                                  {/* زر تعليم كمقروء */}
                                  <button
                                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                                  >
                                    <Check className="w-3 h-3 ml-1" />
                                    تعليم كمقروء
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* رابط عرض الكل إذا كان هناك أكثر من 5 */}
                        {unreadNotifications.length > 5 && (
                          <div className="p-4 text-center border-t border-gray-100">
                            <button
                              onClick={handleViewAllNotifications}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              عرض {unreadNotifications.length - 5} إشعارات أخرى →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* ملف المستخدم مع Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              className="flex items-center gap-1.5 sm:gap-2 md:gap-3 hover:bg-gray-50 rounded-lg p-1 sm:p-1.5 transition-colors"
              onClick={handleProfileClick}
              aria-label="قائمة المستخدم"
              type="button"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-700 text-xs sm:text-sm">
                  {user?.fullName?.charAt(0) || 'م'}
                </span>
              </div>
              
              {/* User info - hidden on small mobile */}
              <div className="hidden sm:block text-right">
                <p className="font-medium text-gray-900 text-xs md:text-sm truncate max-w-[100px] md:max-w-[120px]">
                  {user?.fullName || 'مدير النظام'}
                </p>
                <p className="text-[10px] md:text-xs text-gray-500 truncate">
                  {user?.userType === 'MANAGER' ? 'مدير النظام' : 
                   user?.userType === 'TECHNICIAN' ? 'فني' : 
                   user?.userType === 'CLIENT' ? 'عميل' : 'مستخدم'}
                </p>
              </div>
              
              <ChevronDown 
                size={14} 
                className={`text-gray-500 hidden sm:block flex-shrink-0 md:w-4 md:h-4 transition-transform duration-200 ${
                  showDropdown ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                {/* Backdrop للجوال */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-30 z-40 sm:hidden"
                  onClick={() => setShowDropdown(false)}
                />
                
                <div className="fixed sm:absolute inset-x-0 sm:inset-x-auto bottom-0 sm:bottom-auto top-16 sm:top-10 sm:right-0 mt-2 w-full sm:w-56 bg-white rounded-lg sm:rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] overflow-hidden mx-auto sm:mx-0 max-w-[95vw] sm:max-w-none">
                  {/* User info for mobile */}
                  <div className="sm:hidden p-4 border-b border-gray-200 bg-gray-50">
                    <p className="font-medium text-gray-900 text-base truncate">{user?.fullName}</p>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  {/* Desktop user info */}
                  <div className="hidden sm:block p-4 border-b border-gray-200 bg-gray-50">
                    <p className="font-medium text-gray-900 text-sm truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleMenuItemClick(item)}
                        type="button"
                        className={`flex items-center justify-end gap-2 sm:gap-3 w-full px-4 py-3 sm:px-4 sm:py-2.5 text-right hover:bg-gray-50 transition-colors ${
                          item.danger ? 'text-red-600 hover:text-red-800 hover:bg-red-50' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex-1 text-sm text-right">{item.label}</span>
                        <span className="flex-shrink-0 opacity-70">{item.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;